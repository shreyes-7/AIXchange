import Purchase from "../models/purchase.model.js";

export const createPending = (payload) => Purchase.findOneAndUpdate(
    { transactionHash: payload.transactionHash.toLowerCase() },
    { $setOnInsert: { ...payload, transactionHash: payload.transactionHash.toLowerCase(), status: "PENDING" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
);

export const findById = (purchaseId) => Purchase.findOne({ purchaseId }).lean();
export const findByTransaction = (transactionHash) => Purchase.findOne({ transactionHash: transactionHash.toLowerCase() }).lean();
export const findByBuyer = (buyerWallet, { page = 1, limit = 20 } = {}) => paginate({ buyerWallet: buyerWallet.toLowerCase() }, page, limit);
export const findByDataset = (datasetId, { page = 1, limit = 20 } = {}) => paginate({ datasetId, status: "CONFIRMED" }, page, limit);

const paginate = async (filter, page, limit) => {
    const [purchases, total] = await Promise.all([
        Purchase.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Purchase.countDocuments(filter),
    ]);
    return { purchases, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const saveConfirmed = (payload) => Purchase.findOneAndUpdate(
    { $or: [{ purchaseId: payload.purchaseId }, { transactionHash: payload.transactionHash.toLowerCase() }] },
    { $set: { ...payload, transactionHash: payload.transactionHash.toLowerCase(), status: "CONFIRMED", lastVerifiedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
);

export const markFailed = (transactionHash) => Purchase.findOneAndUpdate(
    { transactionHash: transactionHash.toLowerCase() },
    { $set: { status: "FAILED", lastVerifiedAt: new Date() } },
    { new: true },
);

export const saveRoyalty = (purchaseId, royalty) => Purchase.findOneAndUpdate(
    { purchaseId },
    { $set: { royalty, lastVerifiedAt: new Date() } },
    { new: true },
);
