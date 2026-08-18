import Dataset from "../models/dataset.model.js";
import mongoose from "mongoose";
import purchaseBlockchain from "./purchaseBlockchain.service.js";
import ApiError from "../utils/ApiError.js";

const positiveId = (value, name) => { try { const id = BigInt(value); if (id <= 0n || id > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(); return Number(id); } catch { throw new ApiError(400, `${name} must be a positive integer.`); } };

class AccessControlService {
    async authorize(user, datasetId, licenseId) {
        const wallet = purchaseBlockchain.wallet(user);
        let chainDatasetId;
        try { chainDatasetId = positiveId(datasetId, "datasetId"); } catch (error) { if (!mongoose.isValidObjectId(datasetId)) throw error; }
        const chainLicenseId = positiveId(licenseId, "licenseId");
        const dataset = chainDatasetId ? await Dataset.findOne({ "blockchain.datasetId": String(chainDatasetId), status: "active" }) : await Dataset.findOne({ _id: datasetId, status: "active" });
        if (!dataset) throw new ApiError(404, "Dataset not found.");
        chainDatasetId = positiveId(dataset.blockchain?.datasetId, "dataset blockchain ID");
        const allowed = await purchaseBlockchain.hasAccess(wallet, chainDatasetId, chainLicenseId);
        if (!allowed) throw new ApiError(403, "You do not have access to this dataset under the requested license.");
        return { allowed: true, wallet, dataset, datasetId: chainDatasetId, licenseId: chainLicenseId };
    }
}

export default new AccessControlService();
