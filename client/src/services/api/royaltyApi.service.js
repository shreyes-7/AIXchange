import apiClient from "./apiClient";

export async function calculateRoyaltySplit(payload) {
  const response = await apiClient.post("/royalties/calculate-split", payload);
  return response.data;
}

export async function fetchRoyaltySummary(params = {}) {
  const response = await apiClient.get("/royalties/summary", { params });
  return response.data;
}

export async function fetchRoyaltyHistory(params = {}) {
  const response = await apiClient.get("/royalties/history", { params });
  return response.data;
}

export async function fetchRoyaltyReport(params = {}) {
  const response = await apiClient.get("/royalties/reports/summary", { params });
  return response.data;
}

export async function fetchRecipientRoyaltyHistory(address, params = {}) {
  const response = await apiClient.get(`/royalties/recipients/${address}`, { params });
  return response.data;
}

export async function fetchDistributionById(distributionId) {
  const response = await apiClient.get(`/royalties/distributions/${distributionId}`);
  return response.data;
}

export async function reconcileRoyaltyDistribution(distributionId) {
  const response = await apiClient.post(`/royalties/reconcile/${distributionId}`);
  return response.data;
}

export default {
  calculateRoyaltySplit,
  fetchRoyaltySummary,
  fetchRoyaltyHistory,
  fetchRoyaltyReport,
  fetchRecipientRoyaltyHistory,
  fetchDistributionById,
  reconcileRoyaltyDistribution,
};
