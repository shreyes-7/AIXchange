import Session from "../models/session.model.js";

export const create = (payload) => {
    return Session.create(payload);
};


export const findByRefreshToken = (refreshToken) => {
    return Session.findOne({
        refreshToken,
        status: "ACTIVE",
    });
};

export const revokeSession = (sessionId) => {
    return Session.findByIdAndUpdate(
        sessionId,
        {
            status: "REVOKED",
        },
        {
            new: true,
        }
    );
};

export const revokeAllSessions = (userId) => {
    return Session.updateMany(
        {
            userId,
            status: "ACTIVE",
        },
        {
            status: "REVOKED",
        }
    );
};