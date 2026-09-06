import test from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import RoyaltyDistribution from "../src/models/royalty-distribution.model.js";
import {
    distributionIdParamSchema,
    recipientAddressParamSchema,
    sourceParamsSchema,
    royaltyHistoryQuerySchema,
    royaltyReportQuerySchema,
    calculateSplitSchema,
    prepareDistributeSchema,
    syncTransactionSchema,
    reconcileParamSchema,
} from "../src/validators/royalty.validator.js";
import royaltyBlockchainService from "../src/services/royaltyBlockchain.service.js";

test("Task Group H: Joi validators accept valid royalty inputs and reject invalid parameters", () => {
    // 1. Distribution ID Param
    assert.equal(distributionIdParamSchema.validate({ distributionId: "1" }).error, undefined);
    assert.equal(distributionIdParamSchema.validate({ distributionId: "99999999999999999999" }).error, undefined);
    assert.ok(distributionIdParamSchema.validate({}).error);

    // 2. Recipient Address Param
    const validAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    assert.equal(recipientAddressParamSchema.validate({ address: validAddr }).error, undefined);
    assert.ok(recipientAddressParamSchema.validate({ address: "0xinvalid" }).error);
    assert.ok(recipientAddressParamSchema.validate({ address: "70997970C51812dc3A010C7d01b50e0d17dc79C8" }).error);

    // 3. Source Params
    assert.equal(
        sourceParamsSchema.validate({ sourceType: "PURCHASE", sourceId: "123" }).error,
        undefined
    );
    assert.equal(
        sourceParamsSchema.validate({ sourceType: "direct", sourceId: "0" }).error,
        undefined
    );
    assert.ok(sourceParamsSchema.validate({ sourceType: "UNKNOWN", sourceId: "1" }).error);
    assert.ok(sourceParamsSchema.validate({ sourceType: "DIRECT", sourceId: "" }).error);

    // 4. Calculate Split
    const validSplit = {
        totalRevenue: "1000000000000000000000",
        treasuryFeeBps: 250,
        recipients: [
            { recipient: validAddr, shareBps: 6000 },
        ],
    };
    assert.equal(calculateSplitSchema.validate(validSplit).error, undefined);
    assert.ok(calculateSplitSchema.validate({ ...validSplit, treasuryFeeBps: 2500 }).error); // Exceeds max 2000
    assert.ok(calculateSplitSchema.validate({ ...validSplit, recipients: [] }).error); // Empty recipients

    // 5. Prepare Distribute
    const validPrep = {
        sourceType: "DIRECT",
        sourceId: "0",
        totalRevenue: "1000000000000000000000",
        recipients: [{ recipient: validAddr, shareBps: 5000 }],
    };
    assert.equal(prepareDistributeSchema.validate(validPrep).error, undefined);

    // 6. Sync Transaction
    assert.equal(
        syncTransactionSchema.validate({
            txHash: "0x" + "a".repeat(64),
        }).error,
        undefined
    );
    assert.ok(syncTransactionSchema.validate({ txHash: "0x1234" }).error);

    // 7. Query Schema
    const query = {
        page: 1,
        limit: 50,
        sort: "newest",
        sourceType: "PURCHASE",
        status: "DISTRIBUTED",
    };
    assert.equal(royaltyHistoryQuerySchema.validate(query).error, undefined);
    assert.ok(royaltyHistoryQuerySchema.validate({ limit: 500 }).error); // Limit > 100
});

test("Task Group D: RoyaltyDistribution Model enforces exact string types and default reconciled=false", () => {
    const paths = RoyaltyDistribution.schema.paths;

    // Check exact string types for uint256 / financial amounts
    assert.equal(paths["distributionId"].instance, "String");
    assert.equal(paths["sourceId"].instance, "String");
    assert.equal(paths["totalRevenue"].instance, "String");
    assert.equal(paths["treasuryAmount"].instance, "String");
    const recipientAmountInstance = paths["recipients"].schema.paths["amount"].instance;
    assert.equal(recipientAmountInstance, "String");
    assert.equal(paths["reconciled"].instance, "Boolean");

    // Check default reconciled is FALSE
    const defaultReconciled = paths["reconciled"].defaultValue;
    assert.equal(defaultReconciled, false, "reconciled must default to false");
});

test("Task Group C & F: BigInt exact token accounting without floating-point precision loss", () => {
    // 1 AIX = 10^18 wei. 1,000,000,000 AIX would overflow JS double if represented naively with precision loss
    const rev1 = "1000000000000000000000000000"; // 1B AIX
    const rev2 = "1"; // 1 wei
    const sum = (BigInt(rev1) + BigInt(rev2)).toString();

    assert.equal(sum, "1000000000000000000000000001");
    assert.notEqual(Number(rev1) + Number(rev2), sum); // Verifies JS Number would lose precision!

    // Presentation layer conversion
    const oneEtherWei = "1000000000000000000";
    assert.equal(ethers.formatEther(oneEtherWei), "1.0");
});

test("Task Group C: Blockchain Service source type and status enum mappings", () => {
    assert.equal(royaltyBlockchainService.mapSourceType("PURCHASE"), 0);
    assert.equal(royaltyBlockchainService.mapSourceType("DERIVATIVE"), 1);
    assert.equal(royaltyBlockchainService.mapSourceType("INFERENCE"), 2);
    assert.equal(royaltyBlockchainService.mapSourceType("DIRECT"), 3);

    assert.equal(royaltyBlockchainService.mapSourceTypeName(0), "PURCHASE");
    assert.equal(royaltyBlockchainService.mapSourceTypeName(1), "DERIVATIVE");
    assert.equal(royaltyBlockchainService.mapSourceTypeName(2), "INFERENCE");
    assert.equal(royaltyBlockchainService.mapSourceTypeName(3), "DIRECT");

    assert.equal(royaltyBlockchainService.mapStatusName(1), "PENDING");
    assert.equal(royaltyBlockchainService.mapStatusName(2), "DISTRIBUTED");
    assert.equal(royaltyBlockchainService.mapStatusName(3), "CANCELLED");
});

test("Task Group C: Zero-custody calldata encoding constructs valid ERC20/RoyaltyEngine interaction", () => {
    const caller = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const recipients = [
        { recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", shareBps: 6000 },
        { recipient: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", shareBps: 3750 },
    ];
    const totalRevenue = "1000000000000000000000";

    const iface = royaltyBlockchainService.interface;
    const calldata = iface.encodeFunctionData("distributeRoyalty", [
        3, // DIRECT
        "1",
        totalRevenue,
        recipients,
    ]);

    assert.ok(calldata.startsWith("0x"));
    const decoded = iface.decodeFunctionData("distributeRoyalty", calldata);

    assert.equal(Number(decoded.sourceType), 3);
    assert.equal(decoded.sourceId.toString(), "1");
    assert.equal(decoded.totalRevenue.toString(), totalRevenue);
    assert.equal(decoded.recipients.length, 2);
    assert.equal(decoded.recipients[0].recipient.toLowerCase(), recipients[0].recipient.toLowerCase());
    assert.equal(Number(decoded.recipients[0].shareBps), 6000);
});
