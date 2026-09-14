import apiClient from "./apiClient";

export async function fetchLicenseTemplates() {
  const response = await apiClient.get("/licenses/templates");
  return response.data;
}

export async function fetchLicensesByAsset(assetId) {
  const response = await apiClient.get(`/licenses/asset/${assetId}`);
  return response.data;
}

export async function syncLicenseOnChain({ transactionHash }) {
  const response = await apiClient.post("/licenses/sync", { transactionHash });
  return response.data;
}

export default {
  fetchLicenseTemplates,
  fetchLicensesByAsset,
  syncLicenseOnChain,
};
