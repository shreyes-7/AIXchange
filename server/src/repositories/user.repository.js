import User from "../models/user.model.js";

export const findByEmail = (email) => {
    return User.findOne({ email }).select("+passwordHash");
};

export const findById = (id) => {
    return User.findById(id);
};

export const create = (payload) => {
    return User.create(payload);
};

export const updateLastLogin = (id) => {
    return User.findByIdAndUpdate(
        id,
        {
            lastLoginAt: new Date(),
        },
        {
            new: true,
        }
    );
};