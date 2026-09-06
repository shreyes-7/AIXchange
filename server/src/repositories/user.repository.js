import User from "../models/user.model.js";
import Dataset from "../models/dataset.model.js";
import Model from "../models/model.model.js";
import Report from "../models/report.model.js";
import Purchase from "../models/purchase.model.js";

export const findByEmail = (email) => {
    return User.findOne({ email }).select("+passwordHash");
};

export const findById = (id) => {
    return User.findById(id);
};

export const findByIdWithWalletNonce = (id) => {
    return User.findById(id).select(
        "+wallet.verificationNonce +wallet.nonceExpiresAt"
    );
};

export const create = (payload) => {
    return User.create(payload);
};

export const updateLastLogin = (id) => {
    return User.findByIdAndUpdate(
        id,
        {
            lastLoginAt: new Date(),
        },
        {
            new: true,
        }
    );
};

export const updateWalletNonce = (
    userId,
    nonce,
    expiresAt,
    address,
    chainId
) => {
    return User.findByIdAndUpdate(
        userId,
        {
            "wallet.address": address,
            "wallet.chainId": chainId,
            "wallet.verificationNonce": nonce,
            "wallet.nonceExpiresAt": expiresAt,
        },
        { new: true }
    );
};

export const verifyWallet = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        {
            "wallet.verified": true,
            "wallet.linkedAt": new Date(),
            "wallet.verificationNonce": null,
            "wallet.nonceExpiresAt": null,
        },
        { new: true }
    );
};

export const unlinkWallet = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        {
            wallet: {
                address: null,
                chainId: null,
                verified: false,
                linkedAt: null,
                verificationNonce: null,
                nonceExpiresAt: null,
            },
        },
        { new: true }
    );
};

export const findByWalletAddress = (address) => {
    return User.findOne({
        "wallet.address": address,
        "wallet.verified": true,
    });
};

export const getWalletByUserId = (userId) => {
    return User.findById(userId).select(
        "wallet"
    );
};

export const savePasswordResetToken = (
    userId,
    token,
    expiresAt
) => {
    return User.findByIdAndUpdate(
        userId,
        {
            passwordResetToken: token,
            passwordResetExpiresAt: expiresAt,
        },
        { new: true }
    );
};

export const findByEmailWithResetToken = (
    email
) => {
    return User.findOne({ email }).select(
        "+passwordResetToken"
    );
};

export const findByPasswordResetToken = (
    token
) => {
    return User.findOne({
        passwordResetToken: token,
        passwordResetExpiresAt: {
            $gt: new Date(),
        },
    }).select("+passwordHash +passwordResetToken");
};

export const resetPassword = (
    userId,
    passwordHash
) => {
    return User.findByIdAndUpdate(
        userId,
        {
            passwordHash,

            passwordResetToken: null,

            passwordResetExpiresAt: null,
        },
        {
            new: true,
        }
    );
};

export const saveEmailVerificationToken = (
    userId,
    token,
    expiresAt
) => {
    return User.findByIdAndUpdate(
        userId,
        {
            emailVerificationToken: token,
            emailVerificationExpiresAt: expiresAt,
        },
        { new: true }
    );
};

export const findByEmailVerificationToken = (
    token
) => {
    return User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiresAt: {
            $gt: new Date(),
        },
    }).select("+emailVerificationToken");
};

export const verifyEmail = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        {
            isEmailVerified: true,
            emailVerifiedAt: new Date(),

            emailVerificationToken: null,
            emailVerificationExpiresAt: null,
        },
        { new: true }
    );
};

export const updateUserStatus = (userId, status) => {
    return User.findByIdAndUpdate(
        userId,
        { status },
        { returnDocument: "after" }
    );
};

export const findAdminUsers = async ({
    page = 1,
    limit = 20,
    search,
    status,
    role,
    startDate,
    endDate,
    sort = "newest",
} = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (role) {
        filter.role = role;
    }

    if (search && search.trim()) {
        const query = search.trim();
        filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { "wallet.address": { $regex: query, $options: "i" } },
        ];
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        name_asc: { name: 1 },
        name_desc: { name: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-passwordHash -wallet.verificationNonce -wallet.nonceExpiresAt -passwordResetToken -passwordResetExpiresAt -emailVerificationToken")
            .sort(sortOrder)
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        },
    };
};

export const getUserCounts = async (userId) => {
    const user = await User.findById(userId).select("wallet");
    const walletAddress = user?.wallet?.address;

    const [datasetCount, modelCount, reportCount, purchaseCount] = await Promise.all([
        Dataset.countDocuments({ owner: userId }),
        Model.countDocuments({ owner: userId }),
        Report.countDocuments({ reporterId: userId }),
        walletAddress ? Purchase.countDocuments({ buyerWallet: walletAddress.toLowerCase() }) : 0,
    ]);

    return {
        datasets: datasetCount,
        models: modelCount,
        reportsFiled: reportCount,
        purchases: purchaseCount,
    };
};