import Provenance from "../models/provenance.model.js";

const parsePagination = (options = {}) => {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const parseSort = (sortOption) => {
    if (sortOption === "oldest") return { createdAt: 1, _id: 1 };
    if (sortOption === "block_asc") return { "blockchain.blockNumber": 1, "blockchain.logIndex": 1, _id: 1 };
    if (sortOption === "block_desc") return { "blockchain.blockNumber": -1, "blockchain.logIndex": -1, _id: -1 };
    return { createdAt: -1, _id: -1 }; // newest by default
};

export const findByProvenanceId = (provenanceId) => {
    const idNum = Number(provenanceId);
    if (isNaN(idNum)) return Promise.resolve(null);
    return Provenance.findOne({ provenanceId: idNum });
};

export const findByMongoId = (id) => {
    return Provenance.findById(id);
};

export const findByKey = (datasetId, executionId, modelId, modelVersion) => {
    return Provenance.findOne({
        datasetId: Number(datasetId),
        executionId: String(executionId),
        modelId: Number(modelId),
        modelVersion: Number(modelVersion),
    });
};

export const findByDataset = async (datasetId, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const filter = { datasetId: Number(datasetId) };
    if (typeof options.active === "boolean") {
        filter.active = options.active;
    }

    const [records, total] = await Promise.all([
        Provenance.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        Provenance.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const findByExecution = async (executionId, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const filter = { executionId: String(executionId) };
    if (typeof options.active === "boolean") {
        filter.active = options.active;
    }

    const [records, total] = await Promise.all([
        Provenance.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        Provenance.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const findByModel = async (modelId, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const filter = { modelId: Number(modelId) };
    if (typeof options.active === "boolean") {
        filter.active = options.active;
    }

    const [records, total] = await Promise.all([
        Provenance.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        Provenance.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const findByModelVersion = async (modelId, modelVersion, options = {}) => {
    const { page, limit, skip } = parsePagination(options);
    const filter = {
        modelId: Number(modelId),
        modelVersion: Number(modelVersion),
    };
    if (typeof options.active === "boolean") {
        filter.active = options.active;
    }

    const [records, total] = await Promise.all([
        Provenance.find(filter)
            .sort(parseSort(options.sort))
            .skip(skip)
            .limit(limit),
        Provenance.countDocuments(filter),
    ]);

    return {
        records,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const listAllForModel = (modelId) => {
    return Provenance.find({ modelId: Number(modelId) })
        .sort({ "blockchain.blockNumber": 1, "blockchain.logIndex": 1, createdAt: 1 });
};

export const createOrUpsertProjection = async (data) => {
    const filter = data.provenanceId
        ? { provenanceId: data.provenanceId }
        : {
              datasetId: data.datasetId,
              executionId: data.executionId,
              modelId: data.modelId,
              modelVersion: data.modelVersion,
          };

    return Provenance.findOneAndUpdate(
        filter,
        {
            $set: {
                ...data,
                indexedAt: new Date(),
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
};

export const updateStatus = (provenanceId, active, extra = {}) => {
    return Provenance.findOneAndUpdate(
        { provenanceId: Number(provenanceId) },
        {
            $set: {
                active: Boolean(active),
                ...extra,
                indexedAt: new Date(),
            },
        },
        { new: true }
    );
};

export const existsByEventIdentity = async (eventIdentity) => {
    if (!eventIdentity) return false;
    const count = await Provenance.countDocuments({
        "blockchain.eventIdentity": eventIdentity,
    });
    return count > 0;
};
