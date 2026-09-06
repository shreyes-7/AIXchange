import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../config/constants.js";

export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    "Access denied."
                )
            );
        }

        next();
    };
};

export const requireAdmin = allowRoles(USER_ROLES.ADMIN);

export default allowRoles;