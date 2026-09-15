/**
 * Payment API Service
 * Handles token pricing, order generation, sandbox test checkout, and MetaMask asset tracking.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export async function getPricing() {
  const response = await fetch(`${API_BASE_URL}/payments/pricing`);
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch pricing");
  }
  return result.data;
}

export async function createOrder({ tokenAmount, accessToken }) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tokenAmount }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create order");
  }
  return result.data;
}

export async function simulateSuccess({ orderId, accessToken }) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/payments/simulate-success`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderId }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to simulate payment");
  }
  return result.data;
}

export async function watchTokenInMetaMask({
  tokenAddress,
  symbol = "AIX",
  decimals = 18,
}) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  return window.ethereum.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: tokenAddress,
        symbol,
        decimals,
      },
    },
  });
}
