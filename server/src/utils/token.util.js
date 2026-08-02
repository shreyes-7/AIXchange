import crypto from "crypto";

export const generateRandomToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

export const generateExpiry = (minutes) => {
    return new Date(
        Date.now() + minutes * 60 * 1000
    );
};