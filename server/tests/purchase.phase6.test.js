import test from "node:test";
import assert from "node:assert/strict";
import Purchase from "../src/models/purchase.model.js";
import { purchaseRequestSchema, purchaseSyncSchema } from "../src/validators/purchase.validator.js";
import { PURCHASE_ENGINE_ABI } from "../src/config/purchase-abi.js";
import { Interface } from "ethers";

test("purchase requests only accept dataset and license identifiers", () => {
    assert.equal(purchaseRequestSchema.validate({ datasetId: "42", licenseId: "7" }).error, undefined);
    assert.ok(purchaseRequestSchema.validate({ datasetId: "42", licenseId: "7", buyerWallet: "0x0000000000000000000000000000000000000001" }).error);
    assert.equal(purchaseSyncSchema.validate({ datasetId: "42", licenseId: "7", transactionHash: `0x${"a".repeat(64)}` }).error, undefined);
});

test("purchase model has pending/confirmed lifecycle and event deduplication indexes", () => {
    const purchase = new Purchase({ datasetId: 42, licenseId: 7, buyerWallet: "0x0000000000000000000000000000000000000001", licensorWallet: "0x0000000000000000000000000000000000000002", transactionHash: `0x${"a".repeat(64)}`, chainId: 31337, contractAddress: "0x0000000000000000000000000000000000000003" });
    assert.equal(purchase.validateSync(), undefined);
    assert.equal(purchase.status, "PENDING");
    assert.ok(Purchase.schema.indexes().some(([fields]) => fields.transactionHash === 1 && fields.logIndex === 1));
});

test("PurchaseEngine ABI contains authoritative purchase, access, and event interfaces", () => {
    const iface = new Interface(PURCHASE_ENGINE_ABI);
    assert.ok(iface.getFunction("purchaseDataset"));
    assert.ok(iface.getFunction("hasAccess"));
    assert.ok(iface.getFunction("getPurchase"));
    assert.ok(iface.getEvent("DatasetPurchased"));
    assert.ok(iface.getEvent("RoyaltyTriggered"));
});
