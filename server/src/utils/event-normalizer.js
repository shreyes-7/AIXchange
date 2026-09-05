import { ethers } from "ethers";

/**
 * Converts ethers Result / BigInt values into plain JSON-serializable structures
 */
export const sanitizeArguments = (args) => {
    if (!args) return {};
    const result = {};
    for (const [key, value] of Object.entries(args)) {
        // Skip numeric indices from ethers Result array-like keys
        if (!isNaN(Number(key))) continue;

        if (typeof value === "bigint") {
            result[key] = value.toString();
        } else if (Array.isArray(value)) {
            result[key] = value.map((v) => (typeof v === "bigint" ? v.toString() : v));
        } else if (value && typeof value === "object" && typeof value.toString === "function") {
            result[key] = value.toString();
        } else {
            result[key] = value;
        }
    }
    return result;
};

/**
 * Normalizes raw contract log and parsed ethers event into an auditable document
 */
export const normalizeEvent = ({
    log,
    parsed,
    contractName,
    contractAddress,
    chainId,
    blockTimestamp,
    blockHash,
}) => {
    const rawArgs = parsed.args || {};
    const sanitizedArgs = sanitizeArguments(rawArgs);

    let tokenAddress = undefined;
    let assetId = undefined;
    let datasetId = undefined;
    let modelId = undefined;
    let modelVersion = undefined;
    let licenseId = undefined;
    let purchaseId = undefined;
    let distributionId = undefined;
    let amount = undefined;
    let royaltyAmount = undefined;
    let feeAmount = undefined;
    let from = undefined;
    let to = undefined;

    const eventName = parsed.name;

    // AIX Token
    if (contractName === "AIXToken") {
        tokenAddress = contractAddress.toLowerCase();
        if (eventName === "Transfer") {
            from = rawArgs.from?.toLowerCase();
            to = rawArgs.to?.toLowerCase();
            amount = rawArgs.value?.toString();
        } else if (eventName === "TokensMinted") {
            to = rawArgs.to?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokensBurned") {
            from = rawArgs.from?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "Approval") {
            from = rawArgs.owner?.toLowerCase();
            to = rawArgs.spender?.toLowerCase();
            amount = rawArgs.value?.toString();
        }
    }

    // Treasury
    if (contractName === "Treasury") {
        if (eventName === "ETHDeposited") {
            from = rawArgs.sender?.toLowerCase();
            to = contractAddress.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "ETHWithdrawn") {
            from = contractAddress.toLowerCase();
            to = rawArgs.recipient?.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokenDeposited") {
            tokenAddress = rawArgs.token?.toLowerCase();
            from = rawArgs.sender?.toLowerCase();
            to = contractAddress.toLowerCase();
            amount = rawArgs.amount?.toString();
        } else if (eventName === "TokenWithdrawn") {
            tokenAddress = rawArgs.token?.toLowerCase();
            from = contractAddress.toLowerCase();
            to = rawArgs.recipient?.toLowerCase();
            amount = rawArgs.amount?.toString();
        }
    }

    // DatasetRegistry
    if (contractName === "DatasetRegistry") {
        if (rawArgs.datasetId !== undefined) {
            datasetId = rawArgs.datasetId.toString();
        }
        if (eventName === "DatasetRegistered") {
            to = rawArgs.owner?.toLowerCase();
            royaltyAmount = rawArgs.royalty?.toString();
        } else if (eventName === "DatasetOwnershipTransferred") {
            from = rawArgs.previousOwner?.toLowerCase();
            to = rawArgs.newOwner?.toLowerCase();
        }
    }

    // LicenseRegistry
    if (contractName === "LicenseRegistry") {
        if (rawArgs.licenseId !== undefined) {
            licenseId = rawArgs.licenseId.toString();
        }
        if (rawArgs.assetId !== undefined) {
            assetId = rawArgs.assetId.toString();
        }
        if (eventName === "LicenseCreated") {
            from = rawArgs.licensor?.toLowerCase();
            if (rawArgs.fixedPrice !== undefined && rawArgs.fixedPrice.toString() !== "0") {
                amount = rawArgs.fixedPrice.toString();
            }
            if (rawArgs.royaltyRate !== undefined && rawArgs.royaltyRate.toString() !== "0") {
                royaltyAmount = rawArgs.royaltyRate.toString();
            }
        }
    }

    // PurchaseEngine
    if (contractName === "PurchaseEngine") {
        if (rawArgs.purchaseId !== undefined) {
            purchaseId = rawArgs.purchaseId.toString();
        }
        if (rawArgs.datasetId !== undefined) {
            datasetId = rawArgs.datasetId.toString();
        }
        if (rawArgs.licenseId !== undefined) {
            licenseId = rawArgs.licenseId.toString();
        }
        if (eventName === "DatasetPurchased") {
            from = rawArgs.buyer?.toLowerCase();
            to = rawArgs.licensor?.toLowerCase();
            amount = rawArgs.price?.toString();
            feeAmount = rawArgs.feeAmount?.toString();
            royaltyAmount = rawArgs.licensorAmount?.toString();
        } else if (eventName === "RoyaltyTriggered") {
            to = rawArgs.licensor?.toLowerCase();
            royaltyAmount = rawArgs.licensorAmount?.toString();
            feeAmount = rawArgs.feeAmount?.toString();
        }
    }

    // ModelRegistry
    if (contractName === "ModelRegistry") {
        if (rawArgs.modelId !== undefined) {
            modelId = rawArgs.modelId.toString();
        }
        if (eventName === "ModelRegistered") {
            to = rawArgs.owner?.toLowerCase();
            modelVersion = rawArgs.initialVersion ? Number(rawArgs.initialVersion) : 1;
        } else if (eventName === "ModelVersionAdded") {
            modelVersion = rawArgs.versionNumber ? Number(rawArgs.versionNumber) : undefined;
        } else if (eventName === "ModelOwnershipTransferred") {
            from = rawArgs.previousOwner?.toLowerCase();
            to = rawArgs.newOwner?.toLowerCase();
        }
    }

    // ProvenanceRegistry
    if (contractName === "ProvenanceRegistry") {
        if (rawArgs.provenanceId !== undefined) {
            assetId = rawArgs.provenanceId.toString();
        }
        if (rawArgs.datasetId !== undefined) {
            datasetId = rawArgs.datasetId.toString();
        }
        if (rawArgs.modelId !== undefined) {
            modelId = rawArgs.modelId.toString();
        }
        if (rawArgs.modelVersion !== undefined) {
            modelVersion = Number(rawArgs.modelVersion);
        }
        if (rawArgs.registrant !== undefined) {
            from = rawArgs.registrant.toLowerCase();
        }
    }

    // RoyaltyEngine
    if (contractName === "RoyaltyEngine") {
        if (rawArgs.distributionId !== undefined) {
            distributionId = rawArgs.distributionId.toString();
        }
        if (eventName === "DistributionCreated") {
            from = rawArgs.payer?.toLowerCase();
            amount = rawArgs.totalRevenue?.toString();
        } else if (eventName === "RecipientPaid") {
            to = rawArgs.recipient?.toLowerCase();
            amount = rawArgs.amount?.toString();
            royaltyAmount = rawArgs.amount?.toString();
        } else if (eventName === "TreasuryPaid") {
            to = rawArgs.treasury?.toLowerCase();
            amount = rawArgs.amount?.toString();
            feeAmount = rawArgs.amount?.toString();
        } else if (eventName === "DistributionCompleted") {
            amount = rawArgs.totalDistributed?.toString();
        }
    }

    let amountFormatted = undefined;
    if (amount) {
        try {
            amountFormatted = parseFloat(ethers.formatEther(amount));
        } catch {
            amountFormatted = undefined;
        }
    }

    let royaltyAmountFormatted = undefined;
    if (royaltyAmount) {
        try {
            royaltyAmountFormatted = parseFloat(ethers.formatEther(royaltyAmount));
        } catch {
            royaltyAmountFormatted = undefined;
        }
    }

    return {
        chainId,
        contractAddress: contractAddress.toLowerCase(),
        contractName,
        eventName,
        transactionHash: log.transactionHash.toLowerCase(),
        blockNumber: Number(log.blockNumber),
        blockHash: (blockHash || log.blockHash || "").toLowerCase(),
        blockTimestamp,
        logIndex: Number(log.index),
        arguments: sanitizedArgs,
        tokenAddress,
        assetId,
        datasetId,
        modelId,
        modelVersion,
        licenseId,
        purchaseId,
        distributionId,
        amount,
        amountFormatted,
        royaltyAmount,
        royaltyAmountFormatted,
        feeAmount,
        from,
        to,
    };
};
