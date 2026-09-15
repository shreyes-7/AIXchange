import crypto from "crypto";
import { ethers } from "ethers";
import env from "../config/env.js";
import {
    aixTokenAdminContract,
    aixTokenContract,
    aixTokenAddress,
    cashoutEscrowAdminContract,
    cashoutEscrowContract,
    cashoutEscrowAddress,
    treasuryAddress,
    provider,
} from "../config/blockchain.js";
import blockchainService from "./blockchain.service.js";
import orderRepository from "../repositories/order.repository.js";
import cashoutRepository from "../repositories/cashout.repository.js";
import ApiError from "../utils/ApiError.js";

const TOKEN_PRICE_INR = env.TOKEN_PRICE_INR || 50;
const MIN_CASHOUT_TOKENS = 10; // Production threshold: 10 AIX = ₹500
const CASHOUT_FEE_RATE = 0.02; // 2% platform payout fee

const DEFAULT_BUNDLES = [
    { id: "starter", name: "Starter Pack", tokens: 5, inr: 5 * TOKEN_PRICE_INR, popular: false },
    { id: "builder", name: "Builder Pack", tokens: 10, inr: 10 * TOKEN_PRICE_INR, popular: true },
    { id: "pro", name: "Pro Pack", tokens: 20, inr: 20 * TOKEN_PRICE_INR, popular: false },
    { id: "studio", name: "Studio Pack", tokens: 50, inr: 50 * TOKEN_PRICE_INR, popular: false },
];

class PaymentService {
    getPricing() {
        return {
            tokenPriceInr: TOKEN_PRICE_INR,
            currency: "INR",
            tokenAddress: aixTokenAddress,
            bundles: DEFAULT_BUNDLES,
        };
    }

    async createOrder(user, { tokenAmount }) {
        if (!user?.wallet?.address) {
            throw new ApiError(400, "Please connect a MetaMask wallet before topping up tokens.");
        }

        const walletAddress = blockchainService.validateAddress(user.wallet.address);
        const parsedTokens = parseInt(tokenAmount, 10);

        if (!parsedTokens || parsedTokens < 1) {
            throw new ApiError(400, "Token amount must be a whole number of at least 1 AIX.");
        }

        const fiatAmount = parsedTokens * TOKEN_PRICE_INR;
        const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

        const order = await orderRepository.create({
            orderId,
            userId: user._id,
            walletAddress,
            tokenAmount: parsedTokens,
            fiatAmount,
            currency: "INR",
            status: "PENDING",
            paymentGateway: env.STRIPE_SECRET_KEY ? "stripe" : "sandbox",
        });

        return {
            orderId: order.orderId,
            tokenAmount: order.tokenAmount,
            fiatAmount: order.fiatAmount,
            currency: order.currency,
            walletAddress: order.walletAddress,
            keyId: env.RAZORPAY_KEY_ID,
            status: order.status,
            isSandbox: !env.STRIPE_SECRET_KEY,
        };
    }

    verifyWebhookSignature(rawBody, signature) {
        if (!env.RAZORPAY_WEBHOOK_SECRET || env.NODE_ENV === "test" || !signature) {
            return true; // Bypass in mock/test mode
        }
        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }

    async processWebhook({ orderId, gatewayPaymentId, gatewaySignature = null }) {
        if (!orderId || !gatewayPaymentId) {
            throw new ApiError(400, "orderId and gatewayPaymentId are required.");
        }

        // Idempotency check 1: Has this payment ID already completed an order?
        const existingByPaymentId = await orderRepository.findByGatewayPaymentId(gatewayPaymentId);
        if (existingByPaymentId) {
            return { order: existingByPaymentId, duplicateIgnored: true };
        }

        // Idempotency check 2: Atomic transition PENDING -> PROCESSING
        const order = await orderRepository.transitionToProcessing(orderId, {
            gatewayPaymentId,
            gatewaySignature,
        });

        if (!order) {
            // Already processing or completed
            const currentOrder = await orderRepository.findByOrderId(orderId);
            if (!currentOrder) {
                throw new ApiError(404, `Order ${orderId} not found.`);
            }
            return { order: currentOrder, duplicateIgnored: true };
        }

        // Execute on-chain minting with reconciliation
        return this.reconcileAndMint(order);
    }

    async reconcileAndMint(order) {
        const orderId = order.orderId;
        const walletAddress = order.walletAddress;
        const amountWei = ethers.parseEther(order.tokenAmount.toString());

        // Step 1: Reconcile before minting — check if already mined on-chain
        if (aixTokenAdminContract) {
            try {
                // If there was a previous tx hash, inspect its receipt
                if (order.mintTxHash) {
                    const receipt = await provider.getTransactionReceipt(order.mintTxHash);
                    if (receipt && receipt.status === 1) {
                        const confirmed = await orderRepository.recordMintSuccess(orderId, {
                            mintTxHash: receipt.hash,
                            mintBlockNumber: receipt.blockNumber,
                        });
                        return { order: confirmed, reconciled: true };
                    }
                }

                // Scan recent TokensMinted events on AIXToken contract to detect mined tx during timeout
                const currentBlock = await provider.getBlockNumber();
                const fromBlock = Math.max(0, currentBlock - 50);
                const filter = aixTokenContract.filters.TokensMinted(walletAddress);
                const events = await aixTokenContract.queryFilter(filter, fromBlock, currentBlock);

                const matchingEvent = events.find(
                    (e) => e.args && e.args[1] && e.args[1].toString() === amountWei.toString()
                );

                if (matchingEvent) {
                    const confirmed = await orderRepository.recordMintSuccess(orderId, {
                        mintTxHash: matchingEvent.transactionHash,
                        mintBlockNumber: matchingEvent.blockNumber,
                    });
                    return { order: confirmed, reconciledFromEvent: true };
                }

                // Step 2: Confirmed not executed on-chain — submit fresh mint transaction
                const tx = await aixTokenAdminContract.mint(walletAddress, amountWei);
                const receipt = await tx.wait(1);

                const confirmed = await orderRepository.recordMintSuccess(orderId, {
                    mintTxHash: receipt.hash,
                    mintBlockNumber: receipt.blockNumber,
                });

                return {
                    order: confirmed,
                    mintTxHash: receipt.hash,
                    tokenAddress: aixTokenAddress,
                };
            } catch (err) {
                const failed = await orderRepository.recordMintFailure(orderId, {
                    failureReason: err.message,
                });
                return { order: failed, mintFailed: true, error: err.message };
            }
        } else {
            // Simulated mint for mock test environment without private key
            const mockTxHash = `0xmock_${crypto.randomBytes(16).toString("hex")}`;
            const confirmed = await orderRepository.recordMintSuccess(orderId, {
                mintTxHash: mockTxHash,
                mintBlockNumber: 1000,
            });
            return { order: confirmed, mintTxHash: mockTxHash, simulated: true };
        }
    }

    async retryMint(orderId) {
        const order = await orderRepository.findByOrderId(orderId);
        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found.`);
        }

        if (order.status === "MINTED") {
            return { order, alreadyMinted: true };
        }

        if (order.status !== "MINT_FAILED" && order.status !== "PROCESSING") {
            throw new ApiError(400, `Cannot retry order in status ${order.status}`);
        }

        return this.reconcileAndMint(order);
    }

    async processRefund(orderId, refundReason) {
        const order = await orderRepository.findByOrderId(orderId);
        if (!order) {
            throw new ApiError(404, `Order ${orderId} not found.`);
        }

        if (order.status === "REFUNDED") {
            throw new ApiError(400, "Order is already refunded.");
        }

        // Refund policy: If already minted, require verified token burn before fiat refund
        if (order.status === "MINTED") {
            if (aixTokenAdminContract) {
                try {
                    const amountWei = ethers.parseEther(order.tokenAmount.toString());
                    const tx = await aixTokenAdminContract.burnFrom(order.walletAddress, amountWei);
                    await tx.wait(1);
                } catch (err) {
                    throw new ApiError(
                        400,
                        `Post-mint refund rejected: Unable to recover on-chain tokens from buyer wallet: ${err.message}`
                    );
                }
            }
        }

        const refunded = await orderRepository.recordRefund(orderId, {
            refundReason: refundReason || "Customer requested refund",
        });

        return { order: refunded, message: "Order successfully refunded and tokens reconciled." };
    }

    async requestCashout(user, { tokenAmount, bankDetails, bypassMinimumForTest = false }) {
        if (!user?.wallet?.address) {
            throw new ApiError(400, "Verified creator wallet is required for cashout.");
        }

        const creatorWallet = blockchainService.validateAddress(user.wallet.address);
        const parsedTokens = parseInt(tokenAmount, 10);

        if (!parsedTokens || parsedTokens < 1) {
            throw new ApiError(400, "Token amount must be a positive integer.");
        }

        if (!bypassMinimumForTest && parsedTokens < MIN_CASHOUT_TOKENS) {
            throw new ApiError(400, `Minimum cashout threshold is ${MIN_CASHOUT_TOKENS} AIX (₹${MIN_CASHOUT_TOKENS * TOKEN_PRICE_INR}).`);
        }

        const grossInrAmount = parsedTokens * TOKEN_PRICE_INR;
        const feeInrAmount = grossInrAmount * CASHOUT_FEE_RATE;
        const netPayoutInrAmount = grossInrAmount - feeInrAmount;

        const cashoutId = `cashout_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const cashoutIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(cashoutId));

        let escrowTxHash = null;

        // Execute on-chain escrow lock if contract is available
        if (cashoutEscrowAdminContract) {
            try {
                const amountWei = ethers.parseEther(parsedTokens.toString());
                const tx = await cashoutEscrowAdminContract.lockTokens(
                    cashoutIdBytes32,
                    creatorWallet,
                    amountWei
                );
                const receipt = await tx.wait(1);
                escrowTxHash = receipt.hash;
            } catch (err) {
                throw new ApiError(500, `On-chain escrow lock failed: ${err.message}`);
            }
        } else {
            escrowTxHash = `0xmock_escrow_${crypto.randomBytes(16).toString("hex")}`;
        }

        const cashout = await cashoutRepository.create({
            cashoutId,
            userId: user._id,
            creatorWalletAddress: creatorWallet,
            tokenAmount: parsedTokens,
            grossInrAmount,
            feeInrAmount,
            netPayoutInrAmount,
            bankDetails: bankDetails || {},
            status: "PROCESSING",
            escrowTxHash,
        });

        return {
            cashoutId: cashout.cashoutId,
            tokenAmount: cashout.tokenAmount,
            grossInrAmount: cashout.grossInrAmount,
            feeInrAmount: cashout.feeInrAmount,
            netPayoutInrAmount: cashout.netPayoutInrAmount,
            status: cashout.status,
            escrowTxHash,
        };
    }

    async completeCashoutPayout(cashoutId, payoutReferenceId) {
        const cashout = await cashoutRepository.findByCashoutId(cashoutId);
        if (!cashout) {
            throw new ApiError(404, `Cashout ${cashoutId} not found.`);
        }

        if (cashout.status === "COMPLETED") {
            return { cashout, alreadyCompleted: true };
        }

        let burnTxHash = null;
        const cashoutIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(cashoutId));

        // On-chain burn from escrow contract
        if (cashoutEscrowAdminContract) {
            try {
                const tx = await cashoutEscrowAdminContract.completeAndBurn(cashoutIdBytes32);
                const receipt = await tx.wait(1);
                burnTxHash = receipt.hash;
            } catch (err) {
                throw new ApiError(500, `On-chain burn from escrow failed: ${err.message}`);
            }
        } else {
            burnTxHash = `0xmock_burn_${crypto.randomBytes(16).toString("hex")}`;
        }

        const updated = await cashoutRepository.updateStatus(cashoutId, {
            status: "COMPLETED",
            payoutReferenceId: payoutReferenceId || `payout_ref_${Date.now()}`,
            burnTxHash,
        });

        return { cashout: updated, burnTxHash, message: "Payout confirmed and tokens permanently burned." };
    }

    async failCashoutPayout(cashoutId, failureReason) {
        const cashout = await cashoutRepository.findByCashoutId(cashoutId);
        if (!cashout) {
            throw new ApiError(404, `Cashout ${cashoutId} not found.`);
        }

        let releaseTxHash = null;
        const cashoutIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(cashoutId));

        // Return tokens from escrow back to creator wallet
        if (cashoutEscrowAdminContract) {
            try {
                const tx = await cashoutEscrowAdminContract.releaseTokens(cashoutIdBytes32);
                const receipt = await tx.wait(1);
                releaseTxHash = receipt.hash;
            } catch (err) {
                throw new ApiError(500, `On-chain token release failed: ${err.message}`);
            }
        } else {
            releaseTxHash = `0xmock_release_${crypto.randomBytes(16).toString("hex")}`;
        }

        const updated = await cashoutRepository.updateStatus(cashoutId, {
            status: "FAILED",
            failureReason: failureReason || "Bank transfer failed",
            releaseTxHash,
        });

        return { cashout: updated, releaseTxHash, message: "Payout failed. Tokens safely returned to creator wallet." };
    }

    async getAccountingReport() {
        const [orderAggregates, cashoutAggregates] = await Promise.all([
            orderRepository.getAccountingAggregates(),
            cashoutRepository.getAccountingAggregates(),
        ]);

        let onChainTotalSupply = "0";
        let onChainDecimals = 18;
        let onChainTreasuryBalance = "0";
        let onChainEscrowBalance = "0";

        if (aixTokenContract) {
            try {
                const [supply, decimals] = await Promise.all([
                    aixTokenContract.totalSupply(),
                    aixTokenContract.decimals(),
                ]);
                onChainTotalSupply = ethers.formatUnits(supply, decimals);
                onChainDecimals = Number(decimals);

                if (treasuryAddress) {
                    const treasuryBal = await aixTokenContract.balanceOf(treasuryAddress);
                    onChainTreasuryBalance = ethers.formatUnits(treasuryBal, decimals);
                }

                if (cashoutEscrowContract) {
                    const escrowBal = await cashoutEscrowContract.getLockedBalance();
                    onChainEscrowBalance = ethers.formatUnits(escrowBal, decimals);
                }
            } catch (err) {
                // Keep default zeros if provider offline
            }
        }

        const netFiatCollectedInr = orderAggregates.totalFiatCollectedInr - orderAggregates.totalFiatRefundedInr;
        const netTokensMinted = orderAggregates.totalTokensMinted - cashoutAggregates.totalTokensBurned;
        const expectedFiatLiability = netTokensMinted * TOKEN_PRICE_INR;

        return {
            pricingReference: {
                tokenPriceInr: TOKEN_PRICE_INR,
                currency: "INR",
            },
            onChainSupplyLedger: {
                totalSupplyAIX: onChainTotalSupply,
                treasuryBalanceAIX: onChainTreasuryBalance,
                escrowLockedBalanceAIX: onChainEscrowBalance,
                tokenAddress: aixTokenAddress,
                escrowAddress: cashoutEscrowAddress,
            },
            fiatAccountingLedger: {
                totalFiatCollectedInr: orderAggregates.totalFiatCollectedInr,
                totalFiatRefundedInr: orderAggregates.totalFiatRefundedInr,
                netFiatCollectedInr,
                totalCreatorPayoutsInr: cashoutAggregates.totalNetPayoutsInr,
                totalCashoutFeesEarnedInr: cashoutAggregates.totalFeesEarnedInr,
            },
            reconciliation: {
                totalMintedTokensDatabase: orderAggregates.totalTokensMinted,
                totalBurnedTokensDatabase: cashoutAggregates.totalTokensBurned,
                outstandingTokensDatabase: netTokensMinted,
                expectedFiatLiabilityInr: expectedFiatLiability,
                reconciliationNote:
                    "This report reconciles platform database records with on-chain token supply. It does not independently verify physical off-chain bank account balances.",
            },
        };
    }

    async getUserOrders(user, options) {
        return orderRepository.findByUser(user._id, options);
    }

    async getUserCashouts(user, options) {
        return cashoutRepository.findByUser(user._id, options);
    }
}

export default new PaymentService();
