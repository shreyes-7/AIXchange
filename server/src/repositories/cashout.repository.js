import Cashout from "../models/cashout.model.js";

class CashoutRepository {
    async create(data) {
        return Cashout.create(data);
    }

    async findByCashoutId(cashoutId) {
        return Cashout.findOne({ cashoutId }).lean();
    }

    async updateStatus(cashoutId, updateData) {
        return Cashout.findOneAndUpdate(
            { cashoutId },
            { $set: updateData },
            { new: true }
        );
    }

    async findByUser(userId, { page = 1, limit = 20 } = {}) {
        const filter = { userId };
        const [cashouts, total] = await Promise.all([
            Cashout.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Cashout.countDocuments(filter),
        ]);
        return { cashouts, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getAccountingAggregates() {
        const result = await Cashout.aggregate([
            {
                $group: {
                    _id: null,
                    totalCompletedCashouts: {
                        $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                    },
                    totalTokensBurned: {
                        $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$tokenAmount", 0] },
                    },
                    totalGrossPayoutsInr: {
                        $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$grossInrAmount", 0] },
                    },
                    totalFeesEarnedInr: {
                        $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$feeInrAmount", 0] },
                    },
                    totalNetPayoutsInr: {
                        $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$netPayoutInrAmount", 0] },
                    },
                },
            },
        ]);

        return result[0] || {
            totalCompletedCashouts: 0,
            totalTokensBurned: 0,
            totalGrossPayoutsInr: 0,
            totalFeesEarnedInr: 0,
            totalNetPayoutsInr: 0,
        };
    }
}

export default new CashoutRepository();
