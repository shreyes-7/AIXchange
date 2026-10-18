import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  Coins,
  ArrowRight,
  Hash,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export default function DistributionHistoryTable({
  distributions = [],
  onOpenReconcile,
}) {
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTx, setCopiedTx] = useState(null);

  const handleCopyTx = (tx) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  // Baseline default distribution records
  const defaultDistributions = [
    {
      distributionId: "104",
      sourceType: "PURCHASE",
      assetName: "DeepPulse ResNet-Telemetry Anomaly Predictor",
      assetId: "1",
      grossAmount: "1000.00",
      creatorAmount: "600.00",
      licensorAmount: "375.00",
      treasuryAmount: "25.00",
      txHash: "0x8f4c2e1a3b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",
      blockNumber: 19842295,
      timestamp: "2026-10-18 19:42:10 UTC",
      reconciled: true,
      status: "DISTRIBUTED",
    },
    {
      distributionId: "103",
      sourceType: "DERIVATIVE",
      assetName: "DynamicMLP Vibration Regressor (Fine-Tuning)",
      assetId: "2",
      grossAmount: "2500.00",
      creatorAmount: "1250.00",
      licensorAmount: "875.00",
      treasuryAmount: "62.50",
      txHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
      blockNumber: 19842180,
      timestamp: "2026-10-17 14:15:30 UTC",
      reconciled: true,
      status: "DISTRIBUTED",
    },
    {
      distributionId: "102",
      sourceType: "INFERENCE",
      assetName: "SensoryBERT Multi-Modal Transformer API",
      assetId: "3",
      grossAmount: "500.00",
      creatorAmount: "350.00",
      licensorAmount: "137.50",
      treasuryAmount: "12.50",
      txHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
      blockNumber: 19841920,
      timestamp: "2026-10-16 11:28:44 UTC",
      reconciled: true,
      status: "DISTRIBUTED",
    },
    {
      distributionId: "101",
      sourceType: "PURCHASE",
      assetName: "DeepPulse ResNet-Telemetry Anomaly Predictor",
      assetId: "1",
      grossAmount: "1000.00",
      creatorAmount: "600.00",
      licensorAmount: "375.00",
      treasuryAmount: "25.00",
      txHash: "0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      blockNumber: 19841550,
      timestamp: "2026-10-15 08:50:12 UTC",
      reconciled: true,
      status: "DISTRIBUTED",
    },
  ];

  const activeRecords = distributions.length > 0 ? distributions : defaultDistributions;

  const filtered = activeRecords.filter((rec) => {
    if (filterType !== "ALL" && rec.sourceType !== filterType) return false;
    if (
      searchQuery &&
      !rec.assetName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !rec.distributionId.includes(searchQuery) &&
      !rec.txHash.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 backdrop-blur-md shadow-2xl">
      {/* Table Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <History className="w-4 h-4 text-cyan-400" />
            ON-CHAIN ROYALTY SETTLEMENT LEDGER
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Historical Distribution Records
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Decentralized revenue distributions executed and reconciled on <code>RoyaltyEngine.sol</code>.
          </p>
        </div>

        {/* Filter Badges & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            {["ALL", "PURCHASE", "DERIVATIVE", "INFERENCE"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === type
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or Tx..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Distribution ID</th>
              <th className="py-3 px-4">Asset / Source</th>
              <th className="py-3 px-4">Gross Revenue</th>
              <th className="py-3 px-4">Recipients Allocation</th>
              <th className="py-3 px-4">On-Chain Tx</th>
              <th className="py-3 px-4">Consensus Status</th>
              <th className="py-3 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
            {filtered.map((item) => (
              <tr
                key={item.distributionId}
                className="hover:bg-slate-900/50 transition-colors"
              >
                {/* ID */}
                <td className="py-3.5 px-4 font-bold text-cyan-300">
                  #{item.distributionId}
                </td>

                {/* Asset & Source */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white truncate max-w-xs font-sans">
                    {item.assetName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                      {item.sourceType}
                    </span>
                    <span>{item.timestamp}</span>
                  </div>
                </td>

                {/* Gross Amount */}
                <td className="py-3.5 px-4 font-bold text-white">
                  {parseFloat(item.grossAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} AIX
                </td>

                {/* Allocations */}
                <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                  <div className="text-cyan-300">Creator: {item.creatorAmount} AIX</div>
                  <div className="text-indigo-300">Licensor: {item.licensorAmount} AIX</div>
                  <div className="text-purple-300">Treasury: {item.treasuryAmount} AIX</div>
                </td>

                {/* Tx Hash */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 truncate w-24">
                      {item.txHash.slice(0, 10)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTx(item.txHash)}
                      className="hover:text-cyan-300 text-slate-500 transition-colors"
                      title="Copy Tx Hash"
                    >
                      {copiedTx === item.txHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Block #{item.blockNumber}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    SETTLED
                  </span>
                </td>

                {/* Reconcile Action */}
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => onOpenReconcile && onOpenReconcile(item)}
                  >
                    Reconcile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
