import apiClient from "./apiClient";

export async function fetchModels(params = {}) {
  const response = await apiClient.get("/models", { params });
  return response.data;
}

export async function fetchModelById(modelId) {
  const response = await apiClient.get(`/models/${modelId}`);
  return response.data;
}

export async function prepareModelRegistration(payload) {
  const response = await apiClient.post("/models", payload);
  return response.data;
}

export async function syncModelOnChain(payload) {
  const response = await apiClient.post("/models/sync", payload);
  return response.data;
}

export async function verifyModelHash(modelId, payload) {
  const response = await apiClient.post(`/models/${modelId}/verify-hash`, payload);
  return response.data;
}

export async function runModelInference(modelId, payload) {
  const response = await apiClient.post(`/models/${modelId}/infer`, payload);
  return response.data;
}

export default {
  fetchModels,
  fetchModelById,
  prepareModelRegistration,
  syncModelOnChain,
  verifyModelHash,
  runModelInference,
};
