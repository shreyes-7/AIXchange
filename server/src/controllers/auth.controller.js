import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const metadata = {
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
            device: req.get("user-agent"),
        };

        const result = await authService.login(
            req.body,
            metadata
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refresh(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.logout(refreshToken);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

export const logoutAll = async (req, res, next) => {
    try {
        const result = await authService.logoutAll(req.user.userId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (
    req,
    res,
    next
) => {
    try {
        const profile =
            await authService.getProfile(
                req.user.userId
            );

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await authService.forgotPassword(
                req.body.email
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await authService.resetPassword(
                req.body.token,
                req.body.password
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await authService.verifyEmail(
                req.body.token
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const resendVerification = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await authService.sendVerification(
                req.user.userId
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};