import User from "../models/user.model.js";

export const findByEmail = (email) => {
    return User.findOne({ email }).select("+passwordHash");
};

export const findById = (id) => {
    return User.findById(id);
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