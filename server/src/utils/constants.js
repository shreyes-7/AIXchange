export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
};

export const LICENSE_TYPES = {
    ONE_TIME: "one_time",
    ROYALTY: "royalty",
};

export const DATASET_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
};

export const SANDBOX_STATUS = {
    CREATING: "CREATING",
    READY: "READY",
    RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    TIMEOUT: "TIMEOUT",
};

export const FRAMEWORK_TYPES = {
    PYTORCH: "pytorch",
    TENSORFLOW: "tensorflow",
    SCIKIT_LEARN: "scikit-learn",
};

export const OPTIMIZER_TYPES = {
    ADAM: "adam",
    ADAMW: "adamw",
    SGD: "sgd",
    RMSPROP: "rmsprop",
};

export const LOSS_FUNCTIONS = {
    CROSS_ENTROPY: "cross_entropy",
    MSE: "mse",
    BCE: "bce",
    BCE_WITH_LOGITS: "bce_with_logits",
    L1: "l1",
};

export const SANDBOX_FILE_CATEGORIES = {
    CODE: "code",
    DATA: "data",
    CONFIG: "config",
    NOTEBOOK: "notebook",
    OTHER: "other",
};