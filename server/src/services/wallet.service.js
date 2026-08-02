import crypto from "crypto";
import { ethers } from "ethers";

import * as userRepository from "../repositories/user.repository.js";

import ApiError from "../utils/ApiError.js";

export const generateNonce = async (
    userId,
    address,
    chainId
) => {
    const existingWallet =
        await userRepository.findByWalletAddress(
            address
        );

    if (
        existingWallet &&
        existingWallet._id.toString() !== userId
    ) {
        throw new ApiError(
            409,
            "Wallet already linked to another account."
        );
    }

    const nonce = crypto.randomBytes(32).toString(
        "hex"
    );

    const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
    );

    await userRepository.updateWalletNonce(
        userId,
        nonce,
        expiresAt,
        address.toLowerCase(),
        chainId
    );

    return {
        message:
            "Sign this message to verify wallet ownership.",

        nonce,
    };
};

export const verifyWallet = async (
    userId,
    signature
) => {
    const user =
        await userRepository.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    const { wallet } = user;

    if (
        !wallet.verificationNonce ||
        !wallet.nonceExpiresAt
    ) {
        throw new ApiError(
            400,
            "Verification request not found."
        );
    }

    if (
        new Date() > wallet.nonceExpiresAt
    ) {
        throw new ApiError(
            400,
            "Verification nonce expired."
        );
    }

    const recoveredAddress =
        ethers.verifyMessage(
            wallet.verificationNonce,
            signature
        );

    if (
        recoveredAddress.toLowerCase() !==
        wallet.address.toLowerCase()
    ) {
        throw new ApiError(
            401,
            "Invalid signature."
        );
    }

    const verifiedUser =
        await userRepository.verifyWallet(
            userId
        );

    return {
        wallet: verifiedUser.wallet,
    };
};

export const unlinkWallet = async (
    userId
) => {
    const user =
        await userRepository.unlinkWallet(
            userId
        );

    return {
        wallet: user.wallet,
    };
};

export const getWallet = async (
    userId
) => {
    const user =
        await userRepository.getWalletByUserId(
            userId
        );

    return {
        wallet: user.wallet,
    };
};

