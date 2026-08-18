import Transaction from "../models/transaction.model.js";

class TransactionRepository {
    async upsert(data) {
        return Transaction.updateOne(
            { txHash: data.txHash.toLowerCase(), logIndex: data.logIndex },
            { $setOnInsert: data },
            { upsert: true }
        );
    }

    async findByWallet(walletAddress, { page = 1, limit = 20 } = {}) {
        const address = walletAddress.toLowerCase();
        const filter = { $or: [{ from: address }, { to: address }] };
        const [transactions, total] = await Promise.all([
            Transaction.find(filter).sort({ blockNumber: -1, logIndex: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Transaction.countDocuments(filter),
        ]);
        return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    findByHashForWallet(txHash, walletAddress) {
        const address = walletAddress.toLowerCase();
        return Transaction.find({ txHash: txHash.toLowerCase(), $or: [{ from: address }, { to: address }] })
            .sort({ logIndex: 1 }).lean();
    }
}

export default new TransactionRepository();
