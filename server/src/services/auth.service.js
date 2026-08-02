import * as userRepository from "../repositories/user.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";
import { TIME } from "../config/constants.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { serializeUser } from "../utils/serialize.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt.js";

import {
    generateRandomToken,
    hashToken,
    generateExpiry,
} from "../utils/token.util.js";

import { sendPasswordResetEmail } from "./email.service.js";

import ApiError from "../utils/ApiError.js";

export const register = async ({
    name,
    email,
    password,
}) => {
    const existingUser =
        await userRepository.findByEmail(email);

    if (existingUser) {
        throw new ApiError(
            409,
            "User already exists."
        );
    }

    const passwordHash =
        await hashPassword(password);

    const user = await userRepository.create({
        name,
        email,
        passwordHash,
    });

    try {
        await sendVerification(user._id);
    } catch (error) {
        logger.error(
            "Failed to send verification email",
            error
        );
    }

    return {
        user: serializeUser(user)
    };
};

export const login = async (
    { email, password },
    metadata
) => {
    const user =
        await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(
            401,
            "Invalid credentials."
        );
    }

    const isValid =
        await comparePassword(
            password,
            user.passwordHash
        );

    if (!isValid) {
        throw new ApiError(
            401,
            "Invalid credentials."
        );
    }

    const payload = {
        userId: user._id,
        role: user.role,
    };

    const accessToken =
        generateAccessToken(payload);

    const refreshToken =
        generateRefreshToken(payload);

    await sessionRepository.create({
        userId: user._id,
        refreshToken,

        device: metadata.device,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,

        expiresAt: new Date(
            Date.now() + 7 * TIME.DAY
        ),
    });

    await userRepository.updateLastLogin(
        user._id
    );

    user.passwordHash = undefined;

    return {
        accessToken,
        refreshToken,

        user,
    };
};

export const refresh = async (refreshToken) => {
    const payload =
        verifyRefreshToken(refreshToken);

    const session =
        await sessionRepository.findByRefreshToken(
            refreshToken
        );

    if (!session) {
        throw new ApiError(
            401,
            "Invalid refresh token."
        );
    }

    const accessToken =
        generateAccessToken({
            userId: payload.userId,
            role: payload.role,
        });

    return {
        accessToken,
    };
};

export const logout = async (refreshToken) => {
    const session =
        await sessionRepository.findByRefreshToken(
            refreshToken
        );

    if (!session) {
        throw new ApiError(
            404,
            "Session not found."
        );
    }

    await sessionRepository.revokeSession(
        session._id
    );

    return {
        message: "Logged out successfully.",
    };
};

export const logoutAll = async (userId) => {
    await sessionRepository.revokeAllSessions(
        userId
    );

    return {
        message:
            "Logged out from all devices.",
    };
};

export const getProfile = async (
    userId
) => {
    const user =
        await userRepository.findById(
            userId
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return serializeUser(user);
};

export const forgotPassword = async (
    email
) => {
    const user =
        await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    const token = generateRandomToken();

    const hashedToken =
        hashToken(token);

    const expiresAt =
        generateExpiry(15);

    await userRepository.savePasswordResetToken(
        user._id,
        hashedToken,
        expiresAt
    );

    const resetLink =
        `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await sendPasswordResetEmail(
        user.email,
        resetLink
    );

    return {
        message:
            "Password reset email sent successfully.",
    };
};


export const resetPassword = async (
    token,
    newPassword
) => {
    const hashedToken =
        hashToken(token);

    const user =
        await userRepository.findByPasswordResetToken(
            hashedToken
        );

    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired reset token."
        );
    }

    const passwordHash =
        await hashPassword(
            newPassword
        );

    await userRepository.resetPassword(
        user._id,
        passwordHash
    );

    await sessionRepository.deleteAllSessions(
        user._id
    );

    return {
        message:
            "Password reset successfully.",
    };
};

export const sendVerification = async (
    userId
) => {
    const user =
        await userRepository.findById(
            userId
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    if (user.isEmailVerified) {
        throw new ApiError(
            400,
            "Email already verified."
        );
    }

    const token = generateRandomToken();

    const hashedToken =
        hashToken(token);

    const expiresAt =
        generateExpiry(24 * 60);

    await userRepository.saveEmailVerificationToken(
        userId,
        hashedToken,
        expiresAt
    );

    const verificationLink =
        `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendVerificationEmail(
        user.email,
        verificationLink
    );

    return {
        message:
            "Verification email sent successfully.",
    };
};

export const verifyEmail = async (
    token
) => {
    const hashedToken =
        hashToken(token);

    const user =
        await userRepository.findByEmailVerificationToken(
            hashedToken
        );

    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired token."
        );
    }

    await userRepository.verifyEmail(
        user._id
    );

    return {
        message:
            "Email verified successfully.",
    };
};