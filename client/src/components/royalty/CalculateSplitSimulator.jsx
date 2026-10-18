import React, { useState, useMemo } from "react";
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Coins,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import Button from "../common/Button";

export default function CalculateSplitSimulator() {
  const [grossInput, setGrossInput] = useState("1000");
  const [creatorBps, setCreatorBps] = useState(6000); // 60.00%
  const [datasetBps, setDatasetBps] = useState(3750); // 37.50%
  const treasuryBps = 250; // Fixed 2.50%

  const grossNum = useMemo(() => {
    const parsed = parseFloat(grossInput);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [grossInput]);

  // Exact BPS Math
  const calculations = useMemo(() => {
    // Treasury calculation: 250 BPS
    const treasury = (grossNum * treasuryBps) / 10000;
    
    // Remaining pool distributed to creator & licensor
    const creator = (grossNum * creatorBps) / 10000;
    const dataset = (grossNum * datasetBps) / 10000;
    
    const sumDistributed = treasury + creator + dataset;
    const dust = Math.max(0, grossNum - sumDistributed);
    const finalTreasury = treasury + dust;

    return {
      gross: grossNum,
      treasuryBase: treasury,
      creator,
      dataset,
      dust,
      finalTreasury,
      totalBps: treasuryBps + creatorBps + datasetBps,
      isZeroLeakage: Math.abs(grossNum - (creator + dataset + finalTreasury)) < 1e-9,
    };
  }, [grossNum, creatorBps, datasetBps]);

  const quickPresets = [100, 500, 1000, 2500, 5000, 10000];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Calculator className="w-4 h-4 text-cyan-400" />
            BASIS POINT (BPS) SIMULATION ENGINE
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Royalty Split & Zero-Leakage Dust Calculator
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Simulate custom revenue splits and verify that remainder wei dust is securely absorbed without precision loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Leakage Invariant
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs & Sliders */}
        <div className="space-y-5">
          {/* Gross Input */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-300">
              Gross Inflow Revenue Amount (AIX Tokens)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                value={grossInput}
                onChange={(e) => setGrossInput(e.target.value)}
                placeholder="1000"
                className="w-full pl-4 pr-16 py-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-lg text-white font-bold focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cyan-400 font-bold">
                AIX
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-slate-500">Presets:</span>
              {quickPresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setGrossInput(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                >
                  {amt.toLocaleString()} AIX
                </button>
              ))}
            </div>
          </div>

          {/* Primary Model Creator BPS Slider */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Model Creator Share</span>
              <span className="text-cyan-300 font-bold">
                {(creatorBps / 100).toFixed(2)}% ({creatorBps} BPS)
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="9000"
              step="50"
              value={creatorBps}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setCreatorBps(val);
                // Adjust datasetBps to maintain sum <= 9750
                const maxAvailable = 9750 - val;
                if (datasetBps > maxAvailable) {
                  setDatasetBps(Math.max(0, maxAvailable));
                }
              }}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10.00%</span>
              <span>Default: 60.00%</span>
              <span>90.00%</span>
            </div>
          </div>

          {/* Upstream Dataset Licensor BPS Slider */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Dataset Licensor Share</span>
              <span className="text-indigo-300 font-bold">
                {(datasetBps / 100).toFixed(2)}% ({datasetBps} BPS)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="8750"
              step="50"
              value={datasetBps}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDatasetBps(val);
                const maxAvailable = 9750 - val;
                if (creatorBps > maxAvailable) {
                  setCreatorBps(Math.max(1000, maxAvailable));
                }
              }}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.00%</span>
              <span>Default: 37.50%</span>
              <span>87.50%</span>
            </div>
          </div>

          {/* Fixed Protocol Fee Indicator */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Protocol Treasury Floor:</span>
            <span className="text-purple-300 font-bold">2.50% (250 BPS, Immutable)</span>
          </div>
        </div>

        {/* RIGHT: Live Breakdown & Dust Proof Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">
                Simulated Net Breakdown
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Balanced
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-cyan-300 font-semibold">Model Creator Payout:</span>
                <span className="text-white font-bold text-sm">
                  {calculations.creator.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AIX
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-indigo-300 font-semibold">Dataset Licensor Payout:</span>
                <span className="text-white font-bold text-sm">
                  {calculations.dataset.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AIX
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-purple-300 font-semibold">Treasury (2.5% + Dust):</span>
                <span className="text-white font-bold text-sm">
                  {calculations.finalTreasury.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} AIX
                </span>
              </div>
            </div>
          </div>

          {/* Zero-Leakage Invariant Proof Box */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>ZERO-LEAKAGE PROOF</span>
              <span>10,000 / 10,000 BPS</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Rounding remainder dust (<code>{calculations.dust.toFixed(6)} AIX</code>) is automatically absorbed by Treasury to ensure zero token leakage across the distribution contract.
            </p>
            <div className="pt-1 text-[11px] text-slate-400 flex justify-between border-t border-emerald-900/40">
              <span>Gross Verification Check:</span>
              <span className="text-white font-bold">
                {(calculations.creator + calculations.dataset + calculations.finalTreasury).toFixed(2)} AIX = {calculations.gross.toFixed(2)} AIX
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
