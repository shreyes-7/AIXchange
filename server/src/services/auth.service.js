import * as userRepository from "../repositories/user.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";
import {TIME} from "../config/constants.js";

import { hashPassword, comparePassword } from "../utils/password.js";

import { serializeUser } from "../utils/serialize.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt.js";

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