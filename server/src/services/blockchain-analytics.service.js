import ApiError from "../utils/ApiError.js";
import * as analyticsRepository from "../repositories/blockchain-analytics.repository.js";
import {
    eventsQuerySchema,
    tokenAnalyticsQuerySchema,
    gasAnalyticsQuerySchema,
    overviewQuerySchema,
} from "../validators/blockchain-analytics.validator.js";

/**
 * Service orchestrating Blockchain Analytics requests
 */
class BlockchainAnalyticsService {
    /**
     * Retrieve paginated and filtered blockchain events
     */
    async getEvents(queryParams) {
        const { error, value } = eventsQuerySchema.validate(queryParams, {
            stripUnknown: true,
        });

        if (error) {
            throw new ApiError(400, `Invalid event query parameters: ${error.details[0].message}`);
        }

        return analyticsRepository.queryEvents(value);
    }

    /**
     * Retrieve AIX token metrics, categorized spending, and time activity
     */
    async getTokenAnalytics(queryParams) {
        const { error, value } = tokenAnalyticsQuerySchema.validate(queryParams, {
            stripUnknown: true,
        });

        if (error) {
            throw new ApiError(400, `Invalid token analytics query parameters: ${error.details[0].message}`);
        }

        return analyticsRepository.aggregateTokenAnalytics(value);
    }

    /**
     * Retrieve gas usage metrics, contract breakdown, and time activity
     */
    async getGasAnalytics(queryParams) {
        const { error, value } = gasAnalyticsQuerySchema.validate(queryParams, {
            stripUnknown: true,
        });

        if (error) {
            throw new ApiError(400, `Invalid gas analytics query parameters: ${error.details[0].message}`);
        }

        return analyticsRepository.aggregateGasAnalytics(value);
    }

    /**
     * Retrieve high-level blockchain overview metrics
     */
    async getOverview(queryParams) {
        const { error, value } = overviewQuerySchema.validate(queryParams, {
            stripUnknown: true,
        });

        if (error) {
            throw new ApiError(400, `Invalid overview query parameters: ${error.details[0].message}`);
        }

        return analyticsRepository.getBlockchainOverview(value);
    }
}

export default new BlockchainAnalyticsService();
