class ApiError extends Error {
    constructor(statusCode, message, errors = undefined) {
        super(message);

        this.success = false;
        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
