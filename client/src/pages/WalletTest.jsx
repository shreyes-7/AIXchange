import { useState } from "react";
import {
  connect,
  getWallet,
  linkWallet,
  linkWalletBackend,
  verifyWallet,
} from "../services/blockchain/wallet/wallet.service";

function WalletTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  async function handleLocalTest() {
    setLoading(true);

    try {
      console.log("Connecting Wallet (Local SDK)...");

      const wallet = await connect();

      const linked = await linkWallet();

      const verified = verifyWallet({
        walletAddress: linked.walletAddress,
        message: linked.message,
        signature: linked.signature,
      });

      const currentWallet = await getWallet();

      setResult({
        mode: "Offline Local Mock Test",
        connectedWallet: wallet,
        linkedWallet: linked,
        currentWallet,
        verified,
      });

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBackendTest() {
    const cleanToken = token.trim().replace(/\\+$/, "");

    if (!cleanToken) {
      alert("Please enter a valid JWT Access Token from /api/v1/auth/login first.");
      return;
    }

    setLoading(true);

    try {
      console.log("Linking Wallet with Backend Server...");

      const backendResult = await linkWalletBackend({
        accessToken: cleanToken,
      });

      setResult({
        mode: "End-to-End Backend MongoDB Linking Test",
        backendResponse: backendResult,
      });

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>AIXchange Wallet SDK & Backend Verification Test</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          JWT Access Token (for Backend Test):
        </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT Access Token here..."
          style={{ width: "100%", padding: "8px", maxWidth: "600px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button onClick={handleLocalTest} disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Testing..." : "Run Client-Side SDK Test"}
        </button>

        <button onClick={handleBackendTest} disabled={loading} style={{ padding: "10px 16px", backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "4px" }}>
          {loading ? "Testing..." : "Run End-to-End Backend Verification Test"}
        </button>
      </div>

      <hr />

      <pre
        style={{
          background: "#1e293b",
          color: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default WalletTest;