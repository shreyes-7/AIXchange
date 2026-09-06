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

export const USER_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
});

export const MODERATION_STATUS = Object.freeze({
    ACTIVE: "active",
    ARCHIVED: "archived",
    HIDDEN: "hidden",
    UNDER_REVIEW: "under_review",
    REMOVED: "removed",
});

export const REPORT_TARGET_TYPES = Object.freeze({
    USER: "USER",
    DATASET: "DATASET",
    MODEL: "MODEL",
});

export const REPORT_CATEGORIES = Object.freeze({
    POLICY_VIOLATION: "POLICY_VIOLATION",
    COPYRIGHT: "COPYRIGHT",
    FRAUD: "FRAUD",
    SPAM: "SPAM",
    MALICIOUS_CONTENT: "MALICIOUS_CONTENT",
    MISLEADING_CONTENT: "MISLEADING_CONTENT",
    SECURITY: "SECURITY",
    OTHER: "OTHER",
});

export const REPORT_STATUS = Object.freeze({
    OPEN: "OPEN",
    UNDER_REVIEW: "UNDER_REVIEW",
    RESOLVED: "RESOLVED",
    REJECTED: "REJECTED",
});

export const REPORT_PRIORITIES = Object.freeze({
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
});

export const MODERATION_ACTIONS = Object.freeze({
    USER_SUSPEND: "USER_SUSPEND",
    USER_RESTORE: "USER_RESTORE",
    DATASET_HIDE: "DATASET_HIDE",
    DATASET_RESTORE: "DATASET_RESTORE",
    DATASET_STATUS_CHANGE: "DATASET_STATUS_CHANGE",
    MODEL_HIDE: "MODEL_HIDE",
    MODEL_RESTORE: "MODEL_RESTORE",
    MODEL_STATUS_CHANGE: "MODEL_STATUS_CHANGE",
    REPORT_ASSIGN: "REPORT_ASSIGN",
    REPORT_STATUS_CHANGE: "REPORT_STATUS_CHANGE",
    REPORT_RESOLVE: "REPORT_RESOLVE",
    FRAUD_FLAG_REVIEW: "FRAUD_FLAG_REVIEW",
});

export const FRAUD_REVIEW_STATUS = Object.freeze({
    OPEN: "OPEN",
    UNDER_REVIEW: "UNDER_REVIEW",
    CONFIRMED: "CONFIRMED",
    DISMISSED: "DISMISSED",
});

export const FRAUD_SEVERITY = Object.freeze({
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
});