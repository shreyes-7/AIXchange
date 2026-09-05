import mongoose from "mongoose";

const blockchainGasTxSchema = new mongoose.Schema(
    {
        chainId: { type: Number, required: true },
        transactionHash: { type: String, required: true, lowercase: true, unique: true },
        blockNumber: { type: Number, required: true },
        blockHash: { type: String, required: true, lowercase: true },
        blockTimestamp: { type: Date, required: true },
        contractAddress: { type: String, lowercase: true },
        contractName: { type: String },
        from: { type: String, required: true, lowercase: true },
        to: { type: String, lowercase: true },
        gasUsed: { type: String, required: true }, // BigInt string
        effectiveGasPrice: { type: String, required: true }, // BigInt string
        gasCost: { type: String, required: true }, // BigInt string = gasUsed * effectiveGasPrice
        gasUsedNum: { type: Number, required: true },
        gasCostEth: { type: Number, required: true }, // Human readable ETH decimal
    },
    { timestamps: true }
);

blockchainGasTxSchema.index({ transactionHash: 1 }, { unique: true });
blockchainGasTxSchema.index({ contractAddress: 1, blockTimestamp: -1 });
blockchainGasTxSchema.index({ contractName: 1, blockTimestamp: -1 });
blockchainGasTxSchema.index({ blockTimestamp: -1 });
blockchainGasTxSchema.index({ from: 1 });

export default mongoose.model("BlockchainGasTx", blockchainGasTxSchema);
