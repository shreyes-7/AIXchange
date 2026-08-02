export const USER_ROLES = Object.freeze({
    USER: "USER",
    CREATOR: "CREATOR",
    ADMIN: "ADMIN",
});

export const TOKEN_TYPES = Object.freeze({
    ACCESS: "ACCESS",
    REFRESH: "REFRESH",
    PASSWORD_RESET: "PASSWORD_RESET",
});

export const SESSION_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    REVOKED: "REVOKED",
    EXPIRED: "EXPIRED",
});

export const TIME = {
    MINUTE: 60 * 1000,

    HOUR: 60 * 60 * 1000,

    DAY: 24 * 60 * 60 * 1000,
};