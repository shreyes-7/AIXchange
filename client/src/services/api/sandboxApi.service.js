import apiClient from "./apiClient";

export async function createSandbox(payload) {
  const response = await apiClient.post("/sandboxes", payload);
  return response.data;
}

export async function fetchSandboxes(params = {}) {
  const response = await apiClient.get("/sandboxes", { params });
  return response.data;
}

export async function fetchSandboxById(sandboxId) {
  const response = await apiClient.get(`/sandboxes/${sandboxId}`);
  return response.data;
}

export async function startTraining(sandboxId, payload) {
  const response = await apiClient.post(`/sandboxes/${sandboxId}/train`, payload);
  return response.data;
}

export async function getExecutionLogs(sandboxId, executionId) {
  const response = await apiClient.get(`/sandboxes/${sandboxId}/executions/${executionId}/logs`);
  return response.data;
}

export async function getExecutionStatus(sandboxId, executionId) {
  const response = await apiClient.get(`/sandboxes/${sandboxId}/executions/${executionId}/status`);
  return response.data;
}

export default {
  createSandbox,
  fetchSandboxes,
  fetchSandboxById,
  startTraining,
  getExecutionLogs,
  getExecutionStatus,
};
