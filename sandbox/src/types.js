/**
 * AIXchange - Sandbox SDK Types and Constants (Phase 7)
 * Defines standard lifecycle states, framework configurations, and contract schemas.
 */

export const ExecutionState = Object.freeze({
    CREATING: "CREATING",
    READY: "READY",
    RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    TIMEOUT: "TIMEOUT",
});

export const FrameworkType = Object.freeze({
    PYTORCH: "pytorch",
    TENSORFLOW: "tensorflow",
    SCIKIT_LEARN: "scikit-learn",
});

export const OptimizerType = Object.freeze({
    ADAM: "adam",
    ADAMW: "adamw",
    SGD: "sgd",
    RMSPROP: "rmsprop",
});

export const LossFunctionType = Object.freeze({
    CROSS_ENTROPY: "cross_entropy",
    MSE: "mse",
    BCE: "bce",
    BCE_WITH_LOGITS: "bce_with_logits",
    L1: "l1",
});

export const ExportFormat = Object.freeze({
    SAFETENSORS: "safetensors",
    PT: "pt",
    TORCHSCRIPT: "torchscript",
});

export const FileCategory = Object.freeze({
    CODE: "code",
    DATA: "data",
    CONFIG: "config",
    NOTEBOOK: "notebook",
    OTHER: "other",
});
