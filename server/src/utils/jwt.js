import jwt from "jsonwebtoken";

import env from "../config/env.js";

export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET
    );
};