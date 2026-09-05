import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import BlockchainEvent from "../src/models/blockchain-event.model.js";
import BlockchainGasTx from "../src/models/blockchain-gas-tx.model.js";
import IndexerState from "../src/models/indexer-state.model.js";
import { CONTRACT_ABIS, getActiveContractSources } from "../src/config/contracts.config.js";
import { sanitizeArguments, normalizeEvent } from "../src/utils/event-normalizer.js";
import {
    eventsQuerySchema,
    tokenAnalyticsQuerySchema,
    gasAnalyticsQuerySchema,
    overviewQuerySchema,
} from "../src/validators/blockchain-analytics.validator.js";

test("Contract configurations contain authoritative event ABIs for all 8 contracts", () => {
    const contracts = [
        "AIXToken",
        "Treasury",
        "DatasetRegistry",
        "LicenseRegistry",
        "PurchaseEngine",
        "ModelRegistry",
        "ProvenanceRegistry",
        "RoyaltyEngine",
    ];

    for (const name of contracts) {
        assert.ok(CONTRACT_ABIS[name], `Missing ABI config for ${name}`);
        const iface = new ethers.Interface(CONTRACT_ABIS[name]);
        const events = iface.fragments.filter((f) => f.type === "event");
        assert.ok(events.length > 0, `No events found in ${name} ABI`);
    }

    // Verify key events exist
    const aixInterface = new ethers.Interface(CONTRACT_ABIS.AIXToken);
    assert.ok(aixInterface.getEvent("Transfer"));
    assert.ok(aixInterface.getEvent("TokensMinted"));
    assert.ok(aixInterface.getEvent("TokensBurned"));

    const purchaseInterface = new ethers.Interface(CONTRACT_ABIS.PurchaseEngine);
    assert.ok(purchaseInterface.getEvent("DatasetPurchased"));
    assert.ok(purchaseInterface.getEvent("RoyaltyTriggered"));

    const modelInterface = new ethers.Interface(CONTRACT_ABIS.ModelRegistry);
    assert.ok(modelInterface.getEvent("ModelRegistered"));
    assert.ok(modelInterface.getEvent("ModelVersionAdded"));

    const provenanceInterface = new ethers.Interface(CONTRACT_ABIS.ProvenanceRegistry);
    assert.ok(provenanceInterface.getEvent("ProvenanceRegistered"));

    const royaltyInterface = new ethers.Interface(CONTRACT_ABIS.RoyaltyEngine);
    assert.ok(royaltyInterface.getEvent("DistributionCreated"));
    assert.ok(royaltyInterface.getEvent("RecipientPaid"));
    assert.ok(royaltyInterface.getEvent("TreasuryPaid"));
});

test("Event argument sanitizer converts BigInt values to precision-safe strings", () => {
    const raw = {
        0: "0x123",
        1: 5000000000000000000n,
        sender: "0x123",
        amount: 5000000000000000000n,
        nestedArray: [100n, 200n],
    };

    const sanitized = sanitizeArguments(raw);
    assert.equal(sanitized["0"], undefined, "Positional keys must be filtered out");
    assert.equal(sanitized.sender, "0x123");
    assert.equal(sanitized.amount, "5000000000000000000");
    assert.deepEqual(sanitized.nestedArray, ["100", "200"]);
});

test("Event normalizer correctly extracts domain fields across different contract events", () => {
    const blockTimestamp = new Date("2026-09-05T12:00:00Z");

    // 1. AIXToken Transfer
    const transferNormalized = normalizeEvent({
        log: { transactionHash: "0x" + "a".repeat(64), blockNumber: 100, index: 2 },
        parsed: {
            name: "Transfer",
            args: {
                from: "0x0000000000000000000000000000000000000001",
                to: "0x0000000000000000000000000000000000000002",
                value: 250000000000000000000n, // 250 AIX
            },
        },
        contractName: "AIXToken",
        contractAddress: "0x0000000000000000000000000000000000000003",
        chainId: 31337,
        blockTimestamp,
        blockHash: "0x" + "b".repeat(64),
    });

    assert.equal(transferNormalized.eventName, "Transfer");
    assert.equal(transferNormalized.amount, "250000000000000000000");
    assert.equal(transferNormalized.amountFormatted, 250);
    assert.equal(transferNormalized.from, "0x0000000000000000000000000000000000000001");
    assert.equal(transferNormalized.to, "0x0000000000000000000000000000000000000002");

    // 2. PurchaseEngine DatasetPurchased
    const purchaseNormalized = normalizeEvent({
        log: { transactionHash: "0x" + "c".repeat(64), blockNumber: 101, index: 0 },
        parsed: {
            name: "DatasetPurchased",
            args: {
                purchaseId: 7n,
                datasetId: 42n,
                licenseId: 3n,
                buyer: "0x0000000000000000000000000000000000000001",
                licensor: "0x0000000000000000000000000000000000000002",
                price: 100000000000000000000n, // 100 AIX
                feeAmount: 2500000000000000000n, // 2.5 AIX
                licensorAmount: 97500000000000000000n, // 97.5 AIX
                timestamp: 1788613200n,
            },
        },
        contractName: "PurchaseEngine",
        contractAddress: "0x0000000000000000000000000000000000000004",
        chainId: 31337,
        blockTimestamp,
        blockHash: "0x" + "d".repeat(64),
    });

    assert.equal(purchaseNormalized.purchaseId, "7");
    assert.equal(purchaseNormalized.datasetId, "42");
    assert.equal(purchaseNormalized.licenseId, "3");
    assert.equal(purchaseNormalized.amount, "100000000000000000000");
    assert.equal(purchaseNormalized.feeAmount, "2500000000000000000");
    assert.equal(purchaseNormalized.royaltyAmount, "97500000000000000000");

    // 3. RoyaltyEngine RecipientPaid
    const royaltyNormalized = normalizeEvent({
        log: { transactionHash: "0x" + "e".repeat(64), blockNumber: 102, index: 1 },
        parsed: {
            name: "RecipientPaid",
            args: {
                distributionId: 12n,
                recipient: "0x0000000000000000000000000000000000000005",
                amount: 80000000000000000000n, // 80 AIX
                shareBps: 8000n,
            },
        },
        contractName: "RoyaltyEngine",
        contractAddress: "0x0000000000000000000000000000000000000006",
        chainId: 31337,
        blockTimestamp,
        blockHash: "0x" + "f".repeat(64),
    });

    assert.equal(royaltyNormalized.distributionId, "12");
    assert.equal(royaltyNormalized.royaltyAmount, "80000000000000000000");
    assert.equal(royaltyNormalized.to, "0x0000000000000000000000000000000000000005");
});

test("Mongoose models enforce required uniqueness and checkpoint tracking indexes", () => {
    // BlockchainEvent: compound unique index { transactionHash: 1, logIndex: 1 }
    const eventIndexes = BlockchainEvent.schema.indexes();
    const hasEventUniqueIndex = eventIndexes.some(([fields, options]) => {
        return fields.transactionHash === 1 && fields.logIndex === 1 && options && options.unique === true;
    });
    assert.ok(hasEventUniqueIndex, "BlockchainEvent must enforce unique (transactionHash + logIndex)");

    // BlockchainGasTx: unique index on transactionHash
    const gasIndexes = BlockchainGasTx.schema.indexes();
    const hasGasUniqueIndex = gasIndexes.some(([fields, options]) => {
        return fields.transactionHash === 1 && options && options.unique === true;
    });
    assert.ok(hasGasUniqueIndex, "BlockchainGasTx must enforce unique transactionHash");

    // IndexerState: schema contains checkpoint tracking fields
    assert.ok(IndexerState.schema.paths.lastIndexedBlock);
    assert.ok(IndexerState.schema.paths.lastSuccessfulSync);
    assert.ok(IndexerState.schema.paths.status);
});

test("Gas cost arithmetic preserves precision using integer BigInt calculations", () => {
    const gasUsed = 125000n;
    const effectiveGasPrice = 20000000000n; // 20 gwei
    const gasCost = gasUsed * effectiveGasPrice;

    assert.equal(gasCost.toString(), "2500000000000000"); // 0.0025 ETH in wei
    const gasCostEth = parseFloat(ethers.formatEther(gasCost));
    assert.equal(gasCostEth, 0.0025);

    // Large gas batch summation
    const receipts = [
        { gasUsed: 100000n, effectiveGasPrice: 15000000000n },
        { gasUsed: 250000n, effectiveGasPrice: 20000000000n },
        { gasUsed: 80000n, effectiveGasPrice: 18000000000n },
    ];

    let totalGas = 0n;
    let totalCost = 0n;
    for (const r of receipts) {
        totalGas += r.gasUsed;
        totalCost += r.gasUsed * r.effectiveGasPrice;
    }

    assert.equal(totalGas.toString(), "430000");
    assert.equal(totalCost.toString(), "7940000000000000");
    const avgGas = Number(totalGas / BigInt(receipts.length));
    assert.equal(avgGas, 143333);
});

test("Blockchain Analytics Joi validators accept valid requests and reject malformed input", () => {
    // 1. Events Query Validator
    const validEventQuery = {
        page: 2,
        limit: 50,
        contract: "AIXToken",
        eventName: "Transfer",
        address: "0x0000000000000000000000000000000000000001",
        fromBlock: 100,
        toBlock: 500,
    };
    assert.equal(eventsQuerySchema.validate(validEventQuery).error, undefined);

    const invalidAddressQuery = {
        address: "not-an-eth-address",
    };
    assert.ok(eventsQuerySchema.validate(invalidAddressQuery).error);

    const invalidLimitQuery = {
        limit: 500, // exceeds 100
    };
    assert.ok(eventsQuerySchema.validate(invalidLimitQuery).error);

    // 2. Token Analytics Query Validator
    assert.equal(
        tokenAnalyticsQuerySchema.validate({
            startDate: "2026-09-01T00:00:00.000Z",
            endDate: "2026-09-05T23:59:59.000Z",
            interval: "week",
        }).error,
        undefined
    );

    assert.ok(tokenAnalyticsQuerySchema.validate({ interval: "yearly" }).error);

    // 3. Gas Analytics Query Validator
    assert.equal(
        gasAnalyticsQuerySchema.validate({
            contract: "PurchaseEngine",
            interval: "month",
        }).error,
        undefined
    );

    // 4. Overview Query Validator
    assert.equal(
        overviewQuerySchema.validate({
            startDate: "2026-09-01T00:00:00.000Z",
        }).error,
        undefined
    );
});
