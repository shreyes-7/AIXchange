import License from "../models/license.model.js";

const publicProjection = "-__v";

export const createLicense = (payload) => License.create(payload);
export const findByLicenseId = (licenseId) => License.findOne({ licenseId }).select(publicProjection);
export const findByAsset = (assetType, assetId) => License.find({ assetType, assetId }).sort({ licenseId: -1 }).select(publicProjection);
export const findByLicensor = (licensor) => License.find({ licensor: licensor.toLowerCase() }).sort({ licenseId: -1 }).select(publicProjection);
export const findMany = (filter, { page = 1, limit = 20, sort = "newest" } = {}) => {
    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, version: { version: -1 }, licenseId: { licenseId: -1 } };
    return Promise.all([
        License.find(filter).sort(sortMap[sort] || sortMap.newest).skip((page - 1) * limit).limit(limit).select(publicProjection).lean(),
        License.countDocuments(filter),
    ]).then(([licenses, total]) => ({ licenses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }));
};
export const saveConfirmed = (licenseId, payload) => License.findOneAndUpdate({ licenseId }, { $set: { ...payload, "blockchain.state": "CONFIRMED", "blockchain.lastSyncedAt": new Date() } }, { new: true, upsert: true, setDefaultsOnInsert: true });
export const saveFailed = (licenseId, payload = {}) => License.findOneAndUpdate({ licenseId }, { $set: { ...payload, "blockchain.state": "FAILED", "blockchain.lastSyncedAt": new Date() } }, { new: true });
