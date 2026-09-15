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

export async function startJupyterSession(sandboxId) {
  try {
    const response = await apiClient.post(`/sandboxes/${sandboxId}/jupyter/start`);
    return response.data;
  } catch {
    // Fallback direct to Python AI execution substrate
    const res = await fetch("http://localhost:8000/api/v1/execution/jupyter/start", { method: "POST" });
    return await res.json();
  }
}

export async function getJupyterSessionStatus(sandboxId) {
  try {
    const response = await apiClient.get(`/sandboxes/${sandboxId}/jupyter/status`);
    return response.data;
  } catch {
    // Fallback direct to Python AI execution substrate
    const res = await fetch("http://localhost:8000/api/v1/execution/jupyter/status");
    return await res.json();
  }
}

export async function stopJupyterSession(sandboxId) {
  try {
    const response = await apiClient.post(`/sandboxes/${sandboxId}/jupyter/stop`);
    return response.data;
  } catch {
    const res = await fetch("http://localhost:8000/api/v1/execution/jupyter/stop", { method: "POST" });
    return await res.json();
  }
}

export async function triggerSubstrateTraining(payload) {
  const res = await fetch("http://localhost:8000/api/v1/execution/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Training execution failed" }));
    throw new Error(err.detail || "Training failed");
  }
  return await res.json();
}

export default {
  createSandbox,
  fetchSandboxes,
  fetchSandboxById,
  startTraining,
  getExecutionLogs,
  getExecutionStatus,
  startJupyterSession,
  getJupyterSessionStatus,
  stopJupyterSession,
  triggerSubstrateTraining,
};
