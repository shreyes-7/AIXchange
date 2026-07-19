import ApiError from "../utils/ApiError.js";

const notFound = (req, res, next) => {
    next(
        new ApiError(
            404,
            `Cannot ${req.method} ${req.originalUrl}`
        )
    );
};

export default notFound;