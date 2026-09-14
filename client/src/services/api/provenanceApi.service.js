import apiClient from "./apiClient";

export async function fetchProvenanceGraph(modelId) {
  const response = await apiClient.get(`/provenance/graph/${modelId}`);
  return response.data;
}

export async function fetchProvenanceTimeline(modelId) {
  const response = await apiClient.get(`/provenance/timeline/${modelId}`);
  return response.data;
}

export async function verifyProvenanceRecord(provenanceId, payload) {
  const response = await apiClient.post(`/provenance/${provenanceId}/verify`, payload);
  return response.data;
}

export async function prepareProvenanceRegistration(payload) {
  const response = await apiClient.post("/provenance", payload);
  return response.data;
}

export async function syncProvenanceOnChain(payload) {
  const response = await apiClient.post("/provenance/sync", payload);
  return response.data;
}

export default {
  fetchProvenanceGraph,
  fetchProvenanceTimeline,
  verifyProvenanceRecord,
  prepareProvenanceRegistration,
  syncProvenanceOnChain,
};
