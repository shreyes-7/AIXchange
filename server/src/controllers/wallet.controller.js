import * as walletService from "../services/wallet.service.js";

export const generateNonce = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await walletService.generateNonce(
                req.user.userId,
                req.body.address,
                req.body.chainId
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyWallet = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await walletService.verifyWallet(
                req.user.userId,
                req.body.signature
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const unlinkWallet = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await walletService.unlinkWallet(
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

export const getWallet = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await walletService.getWallet(
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