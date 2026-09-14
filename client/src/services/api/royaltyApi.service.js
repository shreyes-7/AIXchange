import apiClient from "./apiClient";

export async function calculateRoyaltySplit(payload) {
  const response = await apiClient.post("/royalties/calculate-split", payload);
  return response.data;
}

export async function fetchRoyaltyReport(params = {}) {
  const response = await apiClient.get("/royalties/reports/summary", { params });
  return response.data;
}

export async function fetchRecipientRoyaltyHistory(address, params = {}) {
  const response = await apiClient.get(`/royalties/recipients/${address}/history`, { params });
  return response.data;
}

export default {
  calculateRoyaltySplit,
  fetchRoyaltyReport,
  fetchRecipientRoyaltyHistory,
};
