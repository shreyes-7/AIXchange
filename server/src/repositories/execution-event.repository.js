import ExecutionEvent from "../models/execution-event.model.js";

export const record = (payload) => ExecutionEvent.create(payload);

export const findBySandbox = async (sandboxId, { page = 1, limit = 50 } = {}) => {
    const filter = { sandboxId };
    const [events, total] = await Promise.all([
        ExecutionEvent.find(filter)
            .sort({ timestamp: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        ExecutionEvent.countDocuments(filter),
    ]);
    return {
        events,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};

export const findByExecutionId = (executionId) =>
    ExecutionEvent.find({ executionId }).sort({ timestamp: 1 }).lean();
