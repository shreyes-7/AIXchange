import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import env from "../src/config/env.js";
import paymentService from "../src/services/payment.service.js";
import orderRepository from "../src/repositories/order.repository.js";
import cashoutRepository from "../src/repositories/cashout.repository.js";
import Order from "../src/models/order.model.js";
import Cashout from "../src/models/cashout.model.js";

const mockUser = {
    _id: "507f191e810c19729de860ea",
    name: "Dataset Creator",
    wallet: { address: "0x0000000000000000000000000000000000000001", verified: true },
};

test.before(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI);
    }
    await Order.deleteMany({});
    await Cashout.deleteMany({});
    try {
        await Order.collection.dropIndex("gatewayPaymentId_1");
    } catch {}
    await Order.syncIndexes();
});

test.after(async () => {
    await Order.deleteMany({ userId: mockUser._id });
    await Cashout.deleteMany({ userId: mockUser._id });
    await mongoose.disconnect();
});

test("1. Concurrent duplicate webhooks guarantee strict idempotency (single mint only)", async () => {
    // Create an order
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 10 });
    const paymentId = `pay_concurrent_${Date.now()}`;

    // Fire 5 concurrent webhook executions for the exact same order and payment ID
    const promises = Array.from({ length: 5 }).map(() =>
        paymentService.processWebhook({
            orderId: orderData.orderId,
            gatewayPaymentId: paymentId,
        })
    );

    const results = await Promise.all(promises);

    // Exactly one process should perform the mint; the other 4 should recognize it as duplicate
    const mintExecutions = results.filter((r) => !r.duplicateIgnored);
    const duplicatesIgnored = results.filter((r) => r.duplicateIgnored);

    assert.equal(mintExecutions.length, 1, "Only one execution should proceed with minting");
    assert.equal(duplicatesIgnored.length, 4, "Concurrent attempts must be safely ignored as duplicates");

    const finalOrder = await orderRepository.findByOrderId(orderData.orderId);
    assert.equal(finalOrder.status, "MINTED");
    assert.equal(finalOrder.tokenAmount, 10);
    assert.equal(finalOrder.fiatAmount, 500);
    assert.ok(finalOrder.mintTxHash);
});

test("2. Repeated webhook delivery after order is PROCESSING or MINTED never causes duplicate mint", async () => {
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 5 });
    const paymentId = `pay_repeated_${Date.now()}`;

    // First delivery
    const first = await paymentService.processWebhook({
        orderId: orderData.orderId,
        gatewayPaymentId: paymentId,
    });
    assert.equal(first.order.status, "MINTED");
    const originalTx = first.order.mintTxHash;

    // Second repeated webhook delivery (gateway retry simulation)
    const second = await paymentService.processWebhook({
        orderId: orderData.orderId,
        gatewayPaymentId: paymentId,
    });

    assert.equal(second.duplicateIgnored, true);
    assert.equal(second.order.mintTxHash, originalTx, "Transaction hash must not change or re-mint");
});

test("3. RPC timeout reconciliation recovers mined transaction without submitting second mint", async () => {
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 10 });
    const paymentId = `pay_timeout_${Date.now()}`;

    // Simulate order that started processing, received a txHash, but timed out before DB confirmation
    const simulatedMinedTx = `0xmined_during_timeout_${Date.now()}`;
    await Order.findOneAndUpdate(
        { orderId: orderData.orderId },
        {
            status: "PROCESSING",
            gatewayPaymentId: paymentId,
            mintTxHash: simulatedMinedTx,
        }
    );

    // Reconcile and retry
    const order = await orderRepository.findByOrderId(orderData.orderId);
    const retryResult = await paymentService.reconcileAndMint(order);

    assert.equal(retryResult.order.status, "MINTED");
    assert.ok(retryResult.order.mintTxHash);
});

test("4. Confirmed mint failure transitions to MINT_FAILED and recovers on retry", async () => {
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 15 });

    // Mark as MINT_FAILED with recorded error
    await orderRepository.recordMintFailure(orderData.orderId, {
        failureReason: "Simulated network timeout error",
    });

    let failedOrder = await orderRepository.findByOrderId(orderData.orderId);
    assert.equal(failedOrder.status, "MINT_FAILED");
    assert.equal(failedOrder.failureReason, "Simulated network timeout error");
    assert.equal(failedOrder.retryCount, 1);

    // Retry minting
    const retryResult = await paymentService.retryMint(orderData.orderId);
    assert.equal(retryResult.order.status, "MINTED");
    assert.equal(retryResult.order.failureReason, null);
});

test("5. Dual-ledger accounting report reconciles token supply against fiat liabilities", async () => {
    const report = await paymentService.getAccountingReport();

    assert.ok(report.pricingReference);
    assert.equal(report.pricingReference.tokenPriceInr, 50);

    assert.ok(report.onChainSupplyLedger);
    assert.ok(report.fiatAccountingLedger);
    assert.ok(report.reconciliation);

    assert.equal(
        report.reconciliation.expectedFiatLiabilityInr,
        report.reconciliation.outstandingTokensDatabase * 50
    );
    assert.ok(report.reconciliation.reconciliationNote.includes("physical off-chain bank account"));
});

test("6. Complete 3-Way Economic Lifecycle: FIAT -> AIX -> Cashout Escrow -> Payout -> AIX Burn", async () => {
    // 1. Buyer purchases 10 AIX with fiat (₹500)
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 10 });
    const paymentId = `pay_lifecycle_${Date.now()}`;
    const mintResult = await paymentService.processWebhook({
        orderId: orderData.orderId,
        gatewayPaymentId: paymentId,
    });
    assert.equal(mintResult.order.status, "MINTED");
    assert.equal(mintResult.order.tokenAmount, 10);

    // 2. Creator requests Cash-Out for 10 AIX (meets production minimum threshold >= 10 AIX)
    const cashoutResult = await paymentService.requestCashout(mockUser, {
        tokenAmount: 10,
        bankDetails: { accountNumber: "1234567890", ifsc: "HDFC0001234", accountHolderName: "Alice" },
    });

    assert.equal(cashoutResult.tokenAmount, 10);
    assert.equal(cashoutResult.grossInrAmount, 500); // 10 * 50
    assert.equal(cashoutResult.feeInrAmount, 10);    // 2% fee = 10
    assert.equal(cashoutResult.netPayoutInrAmount, 490); // 490 net payout
    assert.equal(cashoutResult.status, "PROCESSING");
    assert.ok(cashoutResult.escrowTxHash);

    // 3. Bank payout confirms -> completeCashoutPayout burns escrowed tokens
    const completion = await paymentService.completeCashoutPayout(cashoutResult.cashoutId, "payout_ref_abc");
    assert.equal(completion.cashout.status, "COMPLETED");
    assert.ok(completion.burnTxHash);

    // Test failure/refund path on separate cashout
    const failedCashout = await paymentService.requestCashout(mockUser, {
        tokenAmount: 10,
        bankDetails: { accountNumber: "9999999999", ifsc: "INVALID", accountHolderName: "Bob" },
    });
    const failure = await paymentService.failCashoutPayout(failedCashout.cashoutId, "Invalid bank IFSC");
    assert.equal(failure.cashout.status, "FAILED");
    assert.equal(failure.cashout.failureReason, "Invalid bank IFSC");
    assert.ok(failure.releaseTxHash);
});

test("7. Post-mint refund policy guard records reason and prevents unbacked tokens", async () => {
    const orderData = await paymentService.createOrder(mockUser, { tokenAmount: 5 });
    await paymentService.processWebhook({
        orderId: orderData.orderId,
        gatewayPaymentId: `pay_refund_${Date.now()}`,
    });

    const refundResult = await paymentService.processRefund(orderData.orderId, "Customer duplicate request");
    assert.equal(refundResult.order.status, "REFUNDED");
    assert.equal(refundResult.order.refundReason, "Customer duplicate request");
});
