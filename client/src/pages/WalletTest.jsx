import { useState } from "react";
import {
  connect,
  getWallet,
  linkWallet,
  verifyWallet,
} from "../services/blockchain/wallet/wallet.service";

function WalletTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);

    try {
      console.log("Connecting Wallet...");

      const wallet = await connect();

      console.log(wallet);

      const linked = await linkWallet();

      console.log(linked);

      const verified = verifyWallet({
        walletAddress: linked.walletAddress,
        message: linked.message,
        signature: linked.signature,
      });

      const currentWallet = await getWallet();

      setResult({
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

  return (
    <div style={{ padding: "40px" }}>
      <h1>AIXchange Wallet SDK Test</h1>

      <button onClick={handleTest} disabled={loading}>
        {loading ? "Testing..." : "Run Wallet Test"}
      </button>

      <hr />

      <pre
        style={{
          background: "#f5f5f5",
          padding: "20px",
          overflow: "auto",
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default WalletTest;