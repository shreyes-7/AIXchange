import React from "react";
import { Layers, AlertCircle } from "lucide-react";

export default function NetworkBadge({
  chainId,
  chainName,
  isSupported = true,
  className = "",
}) {
  const getNetworkDetails = () => {
    const id = Number(chainId);
    if (id === 31337 || id === 1337) {
      return { name: "Hardhat Local #31337", supported: true, color: "emerald" };
    }
    if (id === 11155111) {
      return { name: "Ethereum Sepolia", supported: true, color: "purple" };
    }
    if (chainName) {
      return { name: chainName, supported: isSupported, color: isSupported ? "cyan" : "rose" };
    }
    return { name: `Chain #${chainId || "Unknown"}`, supported: isSupported, color: isSupported ? "cyan" : "rose" };
  };

  const details = getNetworkDetails();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs shadow-sm ${
        details.supported
          ? "bg-slate-900/90 border-slate-800 text-slate-200"
          : "bg-rose-950/40 border-rose-800 text-rose-300"
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          details.supported
            ? details.color === "purple"
              ? "bg-purple-400 animate-pulse"
              : "bg-emerald-400 animate-pulse"
            : "bg-rose-500 animate-ping"
        }`}
      />
      <span className="font-semibold">{details.name}</span>
    </div>
  );
}
