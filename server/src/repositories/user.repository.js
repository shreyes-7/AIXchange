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