import apiClient from "./apiClient";

export async function preparePurchase({ datasetId, licenseId }) {
  const response = await apiClient.post("/purchases", { datasetId, licenseId });
  return response.data;
}

export async function syncPurchase({ transactionHash }) {
  const response = await apiClient.post("/purchases/sync", { transactionHash });
  return response.data;
}

export async function getPurchaseStatus(transactionHash) {
  const response = await apiClient.get(`/purchases/status/${transactionHash}`);
  return response.data;
}

export async function getMyPurchases(params = {}) {
  const response = await apiClient.get("/purchases", { params });
  return response.data;
}

export default {
  preparePurchase,
  syncPurchase,
  getPurchaseStatus,
  getMyPurchases,
};
