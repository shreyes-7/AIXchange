import { verifyAccessToken } from "../utils/jwt.js";

import * as userRepository from "../repositories/user.repository.js";

import ApiError from "../utils/ApiError.js";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            throw new ApiError(
                401,
                "Access token is required."
            );
        }

        const token = authHeader.split(" ")[1];

        const payload = verifyAccessToken(token);

        const user = await userRepository.findById(
            payload.userId
        );

        if (!user) {
            throw new ApiError(
                401,
                "User not found."
            );
        }

        req.user = {
            userId: user._id,
            role: user.role,
            email: user.email,
        };

        next();
    } catch (error) {
        next(
            new ApiError(
                401,
                "Invalid or expired token."
            )
        );
    }
};

export default auth;