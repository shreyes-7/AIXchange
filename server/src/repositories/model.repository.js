import Model from "../models/model.model.js";

const publicProjection = "-__v";

const buildSort = (sort) => {
    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        name_asc: { name: 1 },
        name_desc: { name: -1 },
        version: { currentVersion: -1 },
        popular: { totalVersions: -1, createdAt: -1 },
    };
    return sortMap[sort] || sortMap.newest;
};

export const createModel = (payload) => Model.create(payload);

export const findById = (id) => Model.findById(id).select(publicProjection);

export const findByBlockchainId = (blockchainModelId) =>
    Model.findOne({ blockchainModelId: Number(blockchainModelId) }).select(publicProjection);

export const findByNameAndOwner = (name, ownerWallet) =>
    Model.findOne({
        name: name.trim(),
        ownerWallet: ownerWallet.toLowerCase().trim(),
    }).select(publicProjection);

export const findMany = async (filter = {}, { page = 1, limit = 20, sort = "newest" } = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const sortOrder = buildSort(sort);

    const [models, total] = await Promise.all([
        Model.find(filter)
            .sort(sortOrder)
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .select(publicProjection)
            .lean(),
        Model.countDocuments(filter),
    ]);

    return {
        models,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const search = async (searchTerm, filter = {}, { page = 1, limit = 20, sort = "newest" } = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const queryFilter = { ...filter };
    if (searchTerm && searchTerm.trim()) {
        queryFilter.$text = { $search: searchTerm.trim() };
    }

    const sortOrder = searchTerm && (!sort || sort === "relevance")
        ? { score: { $meta: "textScore" } }
        : buildSort(sort);

    const projection = searchTerm && (!sort || sort === "relevance")
        ? { ...{ score: { $meta: "textScore" } }, __v: 0 }
        : publicProjection;

    const [models, total] = await Promise.all([
        Model.find(queryFilter)
            .sort(sortOrder)
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .select(projection)
            .lean(),
        Model.countDocuments(queryFilter),
    ]);

    return {
        models,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const findByOwner = (ownerWallet, options = {}) =>
    findMany({ ownerWallet: ownerWallet.toLowerCase().trim() }, options);

export const updateMetadata = (id, payload) =>
    Model.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    ).select(publicProjection);

export const saveConfirmed = (blockchainModelId, payload = {}) =>
    Model.findOneAndUpdate(
        { blockchainModelId: Number(blockchainModelId) },
        {
            $set: {
                ...payload,
                "blockchain.state": "CONFIRMED",
                "blockchain.lastSyncedAt": new Date(),
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select(publicProjection);

export const saveFailed = (id, payload = {}) =>
    Model.findByIdAndUpdate(
        id,
        {
            $set: {
                ...payload,
                "blockchain.state": "FAILED",
                "blockchain.lastSyncedAt": new Date(),
            },
        },
        { new: true }
    ).select(publicProjection);

export const addVersion = (blockchainModelId, versionData) =>
    Model.findOneAndUpdate(
        { blockchainModelId: Number(blockchainModelId) },
        {
            $push: { versions: versionData },
            $set: {
                currentVersion: versionData.versionNumber,
                totalVersions: versionData.versionNumber,
                metadataURI: versionData.metadataURI,
                "blockchain.lastSyncedAt": new Date(),
            },
        },
        { new: true }
    ).select(publicProjection);

export const updateStatus = (blockchainModelId, active) =>
    Model.findOneAndUpdate(
        { blockchainModelId: Number(blockchainModelId) },
        {
            $set: {
                active: Boolean(active),
                "blockchain.lastSyncedAt": new Date(),
            },
        },
        { new: true }
    ).select(publicProjection);

export const updateOwnership = (blockchainModelId, newOwnerWallet) =>
    Model.findOneAndUpdate(
        { blockchainModelId: Number(blockchainModelId) },
        {
            $set: {
                ownerWallet: newOwnerWallet.toLowerCase().trim(),
                "blockchain.lastSyncedAt": new Date(),
            },
        },
        { new: true }
    ).select(publicProjection);
