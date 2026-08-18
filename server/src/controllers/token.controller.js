import tokenService from "../services/token.service.js";

class TokenController {
    async getBalance(req, res, next) {
        try {
            const result = await tokenService.getBalance(
                req.user
            );

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getMetadata(req, res, next) {
        try {
            const result =
                await tokenService.getTokenMetadata();

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTotalSupply(req, res, next) {
        try {
            const result =
                await tokenService.getTotalSupply();

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
            } = req.query;

            const result =
                await tokenService.getTransactionHistory(
                    req.user,
                    {
                        page: Number(page),
                        limit: Number(limit),
                    }
                );

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTransactionByHash(req, res, next) {
        try {
            const { txHash } = req.params;

            const result =
                await tokenService.getTransactionByHash(
                    req.user,
                    txHash
                );

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async purchase(req, res, next) {
        try {
            const result = await tokenService.createPurchaseTransaction(req.user, req.body);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTreasuryBalance(req, res, next) {
        try {
            const result = await tokenService.getTreasuryBalance();
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getWalletDashboard(req, res, next) {
        try {
            const result = await tokenService.getWalletDashboard(req.user);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export default new TokenController();
