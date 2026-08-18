import IndexerState from "../models/indexer-state.model.js";

const filterFor = ({ chainId, contractAddress, indexer }) => ({ chainId, contractAddress: contractAddress.toLowerCase(), indexer });

export const get = (identity) => IndexerState.findOne(filterFor(identity)).lean();

export const saveLastIndexedBlock = (identity, lastIndexedBlock) => IndexerState.findOneAndUpdate(
    filterFor(identity),
    { $set: { lastIndexedBlock } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
);
