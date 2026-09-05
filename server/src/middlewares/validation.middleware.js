import ApiError from "../utils/ApiError.js";

const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const data = req[source];

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(
                (detail) => detail.message
            );

            return next(
                new ApiError(
                    400,
                    "Validation failed.",
                    errors
                )
            );
        }

        try {
            req[source] = value;
        } catch {
            Object.defineProperty(req, source, {
                value,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }

        next();
    };
};

export default validate;