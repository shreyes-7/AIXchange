/**
 * ============================================================================
 * AIXchange - Backend Dataset API Service Boundary
 * ----------------------------------------------------------------------------
 * Clean integration client for backend dataset APIs (owned by backend teammate).
 * Connects frontend to backend REST endpoints configured via VITE_API_BASE_URL.
 * No server secrets, Pinata JWTs, or private keys are stored here.
 * ============================================================================
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attaches auth token to outgoing API requests if present.
 * @param {string} token
 */
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Fetches dataset catalog from backend database with optional filters.
 * @param {Object} [params] - Query parameters (search, category, tags, page, limit).
 * @returns {Promise<Object>} Backend response with datasets and pagination.
 */
export async function fetchDatasets(params = {}) {
  try {
    const response = await apiClient.get("/datasets", { params });
    return response.data;
  } catch (error) {
    console.warn("Backend /datasets API unavailable or error occurred:", error.message);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Fetches single dataset details from backend by ID or slug.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export async function fetchDatasetById(id) {
  try {
    const response = await apiClient.get(`/datasets/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend /datasets/${id} API unavailable or error occurred:`, error.message);
    return { success: false, data: null, message: error.message };
  }
}

/**
 * Initiates encrypted dataset upload via backend Pinata/IPFS integration.
 * The backend performs encryption and IPFS pinning securely on the server.
 * @param {FormData} formData
 * @returns {Promise<{ success: boolean, data?: { cid: string, hash: string }, message?: string }>}
 */
export async function uploadDatasetEncrypted(formData) {
  try {
    const response = await apiClient.post("/datasets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.warn("Backend /datasets/upload API unavailable or error occurred:", error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
}

/**
 * Synchronizes on-chain registration with backend MongoDB records.
 * @param {Object} syncPayload
 * @returns {Promise<Object>}
 */
export async function syncDatasetOnChain(syncPayload) {
  try {
    const response = await apiClient.post("/datasets/sync", syncPayload);
    return response.data;
  } catch (error) {
    console.warn("Backend /datasets/sync API unavailable or error occurred:", error.message);
    return { success: false, message: error.message };
  }
}

export default {
  setAuthToken,
  fetchDatasets,
  fetchDatasetById,
  uploadDatasetEncrypted,
  syncDatasetOnChain,
};
