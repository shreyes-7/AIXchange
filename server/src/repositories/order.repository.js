import Order from "../models/order.model.js";

class OrderRepository {
    async create(orderData) {
        return Order.create(orderData);
    }

    async findByOrderId(orderId) {
        return Order.findOne({ orderId }).lean();
    }

    async findById(id) {
        return Order.findById(id);
    }

    async findByGatewayPaymentId(gatewayPaymentId) {
        return Order.findOne({ gatewayPaymentId }).lean();
    }

    async transitionToProcessing(orderId, { gatewayPaymentId, gatewaySignature }) {
        return Order.findOneAndUpdate(
            { orderId, status: "PENDING" },
            {
                $set: {
                    status: "PROCESSING",
                    gatewayPaymentId,
                    gatewaySignature,
                    mintStartedAt: new Date(),
                    mintAttempt: 1,
                },
            },
            { returnDocument: "after" }
        );
    }

    async recordMintSuccess(orderId, { mintTxHash, mintBlockNumber = null }) {
        return Order.findOneAndUpdate(
            { orderId },
            {
                $set: {
                    status: "MINTED",
                    mintTxHash,
                    mintBlockNumber,
                    mintConfirmedAt: new Date(),
                    failureReason: null,
                },
            },
            { returnDocument: "after" }
        );
    }

    async recordMintFailure(orderId, { failureReason }) {
        return Order.findOneAndUpdate(
            { orderId },
            {
                $set: {
                    status: "MINT_FAILED",
                    failureReason,
                    lastRetryAt: new Date(),
                },
                $inc: { retryCount: 1 },
            },
            { returnDocument: "after" }
        );
    }

    async recordRefund(orderId, { refundReason }) {
        return Order.findOneAndUpdate(
            { orderId },
            {
                $set: {
                    status: "REFUNDED",
                    refundReason,
                },
            },
            { returnDocument: "after" }
        );
    }

    async findByUser(userId, { page = 1, limit = 20 } = {}) {
        const filter = { userId };
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Order.countDocuments(filter),
        ]);
        return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getAccountingAggregates() {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalMintedOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "MINTED"] }, 1, 0] },
                    },
                    totalTokensMinted: {
                        $sum: { $cond: [{ $eq: ["$status", "MINTED"] }, "$tokenAmount", 0] },
                    },
                    totalFiatCollectedInr: {
                        $sum: { $cond: [{ $eq: ["$status", "MINTED"] }, "$fiatAmount", 0] },
                    },
                    totalRefundedOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "REFUNDED"] }, 1, 0] },
                    },
                    totalFiatRefundedInr: {
                        $sum: { $cond: [{ $eq: ["$status", "REFUNDED"] }, "$fiatAmount", 0] },
                    },
                },
            },
        ]);

        return result[0] || {
            totalMintedOrders: 0,
            totalTokensMinted: 0,
            totalFiatCollectedInr: 0,
            totalRefundedOrders: 0,
            totalFiatRefundedInr: 0,
        };
    }
}

export default new OrderRepository();
