import apiClient from "./apiClient";

export async function fetchAnalyticsOverview() {
  try {
    const response = await apiClient.get("/analytics/overview");
    return response.data;
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function fetchRevenueAnalytics(params = {}) {
  try {
    const response = await apiClient.get("/analytics/revenue", { params });
    return response.data;
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function fetchBlockchainGasAnalytics(params = {}) {
  try {
    const response = await apiClient.get("/analytics/blockchain/gas", { params });
    return response.data;
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export async function fetchBlockchainOverview() {
  try {
    const response = await apiClient.get("/analytics/blockchain/overview");
    return response.data;
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

export default {
  fetchAnalyticsOverview,
  fetchRevenueAnalytics,
  fetchBlockchainGasAnalytics,
  fetchBlockchainOverview,
};
