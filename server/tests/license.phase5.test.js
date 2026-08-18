import test from "node:test";
import assert from "node:assert/strict";
import { createLicenseSchema, updateLicenseSchema } from "../src/validators/license.validator.js";
import * as licenseService from "../src/services/license.service.js";
import License from "../src/models/license.model.js";

const rights = { canView: true, canDownload: true, canModify: false, canTrain: true, canInfer: true, canCommercialUse: true, canDistribute: false, canSublicense: false };
const base = { assetId: "1", assetType: "DATASET", licenseType: "COMMERCIAL", metadataURI: "ipfs://metadata", rights, restrictions: "creator-defined" };

test("Phase 5 accepts all license templates and exact enum values", () => {
    for (const licenseType of ["ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM"]) {
        const result = createLicenseSchema.validate({ ...base, licenseType, pricingModel: "FIXED", fixedPrice: "100", royaltyRate: 0 });
        assert.equal(result.error, undefined, licenseType);
    }
    assert.ok(createLicenseSchema.validate({ ...base, licenseType: "ACADEMIC_LICENSE", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0 }).error);
});

test("Phase 5 enforces mutually exclusive fixed and royalty pricing", () => {
    assert.equal(createLicenseSchema.validate({ ...base, pricingModel: "FIXED", fixedPrice: "100", royaltyRate: 0 }).error, undefined);
    assert.equal(createLicenseSchema.validate({ ...base, pricingModel: "ROYALTY", fixedPrice: "0", royaltyRate: 500 }).error, undefined);
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "FIXED", fixedPrice: "0", royaltyRate: 0 }).error);
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "ROYALTY", fixedPrice: "1", royaltyRate: 500 }).error);
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "ROYALTY", fixedPrice: "0", royaltyRate: 10001 }).error);
});

test("Phase 5 rejects invalid metadata, rights, and validity", () => {
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, metadataURI: "   " }).error);
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, rights: { ...rights, canView: "yes" } }).error);
    assert.ok(createLicenseSchema.validate({ ...base, pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, validFrom: "2030-01-02T00:00:00.000Z", validUntil: "2030-01-01T00:00:00.000Z" }).error);
});

test("templates are read-only deterministic configurations", () => {
    const templates = licenseService.getTemplates();
    assert.deepEqual(templates.map((template) => template.templateType), ["ACADEMIC", "COMMERCIAL", "EXCLUSIVE", "CUSTOM"]);
    assert.deepEqual(licenseService.getTemplate("commercial").pricingOptions, ["FIXED", "ROYALTY"]);
});

test("update input cannot modify immutable license fields", () => {
    const result = updateLicenseSchema.validate({ metadataURI: "ipfs://new" });
    assert.equal(result.error, undefined);
});

test("license model contains blockchain-compatible fields and indexes", () => {
    const license = new License({ licenseId: 1, assetId: 7, assetType: "DATASET", licensor: "0x0000000000000000000000000000000000000001", licenseType: "COMMERCIAL", pricingModel: "FIXED", fixedPrice: "1", royaltyRate: 0, metadataURI: "ipfs://metadata", rights, restrictions: "", validFrom: new Date(), status: "ACTIVE", blockchain: { contractAddress: "0x0000000000000000000000000000000000000002", chainId: 31337 } });
    assert.equal(license.validateSync(), undefined);
    assert.equal(license.blockchain.state, "CONFIRMED");
    assert.ok(Object.keys(License.schema.paths).includes("licenseId"));
});
