import apiClient, { setAuthToken } from "./apiClient";

export async function registerUser({ name, email, password }) {
  const response = await apiClient.post("/auth/register", { name, email, password });
  if (response.data?.data?.accessToken) {
    setAuthToken(response.data.data.accessToken);
  }
  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await apiClient.post("/auth/login", { email, password });
  if (response.data?.data?.accessToken) {
    setAuthToken(response.data.data.accessToken);
  }
  return response.data;
}

export async function logoutUser() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    setAuthToken(null);
  }
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

export async function requestWalletNonce({ address, chainId }) {
  const response = await apiClient.post("/wallet/nonce", { address, chainId });
  return response.data;
}

export async function verifyWalletSignature({ address, signature, chainId }) {
  const response = await apiClient.post("/wallet/verify", { address, signature, chainId });
  return response.data;
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  requestWalletNonce,
  verifyWalletSignature,
};
