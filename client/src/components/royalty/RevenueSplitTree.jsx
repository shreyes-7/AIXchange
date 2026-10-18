import React, { useState } from "react";
import {
  Coins,
  ShieldCheck,
  User,
  Database,
  Box,
  Cpu,
  ArrowDown,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export default function RevenueSplitTree({ grossAmount = 1000 }) {
  const [selectedPreset, setSelectedPreset] = useState("standard");
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Preset configurations: gross revenue & BPS allocations
  const presets = {
    standard: {
      name: "Direct Model Monetization",
      gross: 1000,
      treasuryBps: 250, // 2.50%
      creatorBps: 6000, // 60.00%
      datasetBps: 3750, // 37.50%
      desc: "Standard marketplace sale: 2.5% protocol fee, 60% model creator, 37.5% upstream dataset licensor.",
    },
    derivative: {
      name: "Multi-Parent Fine-Tuning Split",
      gross: 2500,
      treasuryBps: 250, // 2.50%
      creatorBps: 5000, // 50.00%
      datasetBps: 3500, // 35.00%
      sandboxHostBps: 1250, // 12.50%
      desc: "Fine-tuned checkpoint sale splitting revenue between model author, training dataset, and sandbox GPU node.",
    },
    inference: {
      name: "High-Throughput Inference Call Pool",
      gross: 500,
      treasuryBps: 250, // 2.50%
      creatorBps: 7000, // 70.00%
      datasetBps: 2750, // 27.50%
      desc: "Batch forward-pass inference monetization routed directly through on-chain attestation.",
    },
  };

  const active = presets[selectedPreset];
  const gross = active.gross;

  // Exact BPS Math
  const treasuryAmount = (gross * active.treasuryBps) / 10000;
  const netPool = gross - treasuryAmount;
  const creatorAmount = (netPool * (active.creatorBps / (10000 - active.treasuryBps)));
  const datasetAmount = (netPool * (active.datasetBps / (10000 - active.treasuryBps)));
  const sandboxAmount = active.sandboxHostBps
    ? (netPool * (active.sandboxHostBps / (10000 - active.treasuryBps)))
    : 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 backdrop-blur-md shadow-2xl">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Coins className="w-4 h-4 text-cyan-400" />
            AUTOMATED REVENUE DISTRIBUTION GRAPH
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Multi-Party Revenue Split Visualizer
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Decentralized secondary royalties calculated via <code>RoyaltyEngine.sol</code> basis points (BPS).
          </p>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          {Object.entries(presets).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedPreset === key
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {key === "standard" ? "Standard" : key === "derivative" ? "Derivative" : "Inference"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        Scenario: <span className="text-white font-semibold">{active.name}</span> — {active.desc}
      </p>

      {/* Hierarchical Visual Flow Chart */}
      <div className="space-y-6 pt-2">
        {/* ROOT: Gross Revenue Payment */}
        <div className="max-w-md mx-auto">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-950 to-indigo-950/80 border border-cyan-500/40 shadow-xl text-center space-y-2 relative">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">
              <Coins className="w-4 h-4" />
              <span>Gross Inflow Payment (100%)</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {gross.toLocaleString(undefined, { minimumFractionDigits: 2 })} AIX
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Purchased via TokenSale.sol / Marketplace Contract
            </p>

            {/* Downward Connector Arrow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 z-10">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* LEVEL 1: Split into Platform Treasury & Net Creator Pool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-3xl mx-auto relative">
          {/* Branch A: Protocol Treasury (2.50%) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-purple-500/40 hover:border-purple-400 space-y-3 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
                Platform Treasury (2.50%)
              </span>
              <span className="text-slate-500 font-bold">250 BPS</span>
            </div>
            <div className="text-2xl font-extrabold text-purple-300 font-mono">
              {treasuryAmount.toFixed(2)} AIX
            </div>
            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Contract:</span>
                <span className="text-slate-300">Treasury.sol</span>
              </div>
              <div className="flex justify-between">
                <span>Zero-Leakage Dust:</span>
                <span className="text-emerald-400 font-bold">+0.000000 wei absorbed</span>
              </div>
            </div>
          </div>

          {/* Branch B: Net Creator Revenue Pool (97.50%) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-400 space-y-3 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold">
                Net Contributor Pool (97.50%)
              </span>
              <span className="text-slate-500 font-bold">9,750 BPS</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 font-mono">
              {netPool.toFixed(2)} AIX
            </div>
            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Routing:</span>
                <span className="text-slate-300">Automated Secondary Splits</span>
              </div>
              <div className="flex justify-between">
                <span>Distribution:</span>
                <span className="text-cyan-300">Direct ERC-20 Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Downward Connector to Sub-Recipients */}
        <div className="flex justify-center -my-2">
          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-cyan-400">
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        {/* LEVEL 2: Direct Contributor Recipients Grid */}
        <div className={`grid grid-cols-1 ${sandboxAmount > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 max-w-4xl mx-auto`}>
          {/* Primary Model Creator */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Box className="w-3.5 h-3.5" />
                <span>Primary Model Creator</span>
              </span>
              <span className="text-[11px] font-bold text-cyan-400">
                {((creatorAmount / gross) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {creatorAmount.toFixed(2)} AIX
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="truncate">0xf39Fd6e5...b92266</span>
              <button
                type="button"
                onClick={() => handleCopy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "creator")}
                className="hover:text-cyan-300 text-slate-500 transition-colors"
              >
                {copiedKey === "creator" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Upstream Dataset Licensor */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-400 space-y-3 transition-all">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>Dataset Licensor</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-400">
                {((datasetAmount / gross) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {datasetAmount.toFixed(2)} AIX
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="truncate">0x70997970...0d17dc</span>
              <button
                type="button"
                onClick={() => handleCopy("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "licensor")}
                className="hover:text-cyan-300 text-slate-500 transition-colors"
              >
                {copiedKey === "licensor" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Compute Sandbox Host (if derivative scenario) */}
          {sandboxAmount > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 space-y-3 transition-all">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Sandbox GPU Host</span>
                </span>
                <span className="text-[11px] font-bold text-amber-400">
                  {((sandboxAmount / gross) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                {sandboxAmount.toFixed(2)} AIX
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span className="truncate">0x3C44CdDd...fa293b</span>
                <button
                  type="button"
                  onClick={() => handleCopy("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "host")}
                  className="hover:text-cyan-300 text-slate-500 transition-colors"
                >
                  {copiedKey === "host" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
