import React from "react";
import {
  Coins,
  Cpu,
  Database,
  Box,
  TrendingUp,
  Fuel,
  Users,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OverviewTab({ metrics = {} }) {
  const kpis = [
    {
      label: "Gross Marketplace Volume (GMV)",
      value: "184,950.00 AIX",
      subtext: "+24.2% vs previous period",
      trend: "positive",
      icon: Coins,
      accent: "cyan",
      borderColor: "border-cyan-500/30",
      iconBg: "bg-cyan-950/60 text-cyan-400 border-cyan-800/60",
    },
    {
      label: "Neural Forward-Pass Invocations",
      value: "842,100 Calls",
      subtext: "14.2ms avg inference latency",
      trend: "positive",
      icon: Zap,
      accent: "purple",
      borderColor: "border-purple-500/30",
      iconBg: "bg-purple-950/60 text-purple-400 border-purple-800/60",
    },
    {
      label: "Dataset Bandwidth & Storage",
      value: "184.2 GB",
      subtext: "3,420 IPFS retrieval pins",
      trend: "positive",
      icon: Database,
      accent: "emerald",
      borderColor: "border-emerald-500/30",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    },
    {
      label: "Docker Sandbox Compute Hours",
      value: "1,280.5 Hours",
      subtext: "99.8% training completion rate",
      trend: "positive",
      icon: Cpu,
      accent: "amber",
      borderColor: "border-amber-500/30",
      iconBg: "bg-amber-950/60 text-amber-400 border-amber-800/60",
    },
    {
      label: "AIX Token Turnover Velocity",
      value: "4.82x Velocity",
      subtext: "2,180 on-chain token transfers",
      trend: "positive",
      icon: TrendingUp,
      accent: "indigo",
      borderColor: "border-indigo-500/30",
      iconBg: "bg-indigo-950/60 text-indigo-400 border-indigo-800/60",
    },
    {
      label: "Cumulative EVM Gas Consumed",
      value: "18.45M Gas",
      subtext: "0.0034 ETH equivalent spent",
      trend: "neutral",
      icon: Fuel,
      accent: "rose",
      borderColor: "border-rose-500/30",
      iconBg: "bg-rose-950/60 text-rose-400 border-rose-800/60",
    },
    {
      label: "Active Authenticated Wallets",
      value: "412 Accounts",
      subtext: "+15.8% monthly user growth",
      trend: "positive",
      icon: Users,
      accent: "blue",
      borderColor: "border-blue-500/30",
      iconBg: "bg-blue-950/60 text-blue-400 border-blue-800/60",
    },
    {
      label: "On-Chain Provenance Anchors",
      value: "148 Records",
      subtext: "100% Merkle consensus verified",
      trend: "positive",
      icon: ShieldCheck,
      accent: "emerald",
      borderColor: "border-emerald-500/30",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    },
  ];

  const topAssets = [
    {
      rank: 1,
      name: "DeepPulse ResNet-Telemetry Anomaly Predictor",
      type: "MODEL",
      revenue: "42,800 AIX",
      volume: "84 purchases",
      accuracy: "98.42%",
      link: "/models/1",
    },
    {
      rank: 2,
      name: "Industrial IoT Sensor Telemetry",
      type: "DATASET",
      revenue: "38,500 AIX",
      volume: "154 downloads",
      accuracy: "150K rows",
      link: "/datasets/1",
    },
    {
      rank: 3,
      name: "DynamicMLP Vibration Regressor",
      type: "MODEL",
      revenue: "28,250 AIX",
      volume: "62 purchases",
      accuracy: "99.00%",
      link: "/models/2",
    },
    {
      rank: 4,
      name: "Decentralized Sensor Telemetry Corpus v2",
      type: "DATASET",
      revenue: "22,100 AIX",
      volume: "98 downloads",
      accuracy: "220K rows",
      link: "/datasets/2",
    },
    {
      rank: 5,
      name: "SensoryBERT Multi-Modal Transformer",
      type: "MODEL",
      revenue: "19,400 AIX",
      volume: "45 purchases",
      accuracy: "97.80%",
      link: "/models/3",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 8-Dimensional KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-slate-900/70 border ${kpi.borderColor} backdrop-blur-md space-y-3 shadow-xl transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider line-clamp-1">
                  {kpi.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${kpi.iconBg}`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{kpi.subtext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Assets Performance Mini-Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              MARKETPLACE LEADERBOARD
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Top Monetized Assets & Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Ranked by Cumulative AIX Volume
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12">Rank</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Asset Type</th>
                <th className="py-3 px-4">Volume / Activity</th>
                <th className="py-3 px-4">Accuracy / Size</th>
                <th className="py-3 px-4 text-right">Revenue (AIX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {topAssets.map((asset) => (
                <tr
                  key={asset.rank}
                  className="hover:bg-slate-900/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    #{asset.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      to={asset.link}
                      className="font-semibold text-white hover:text-cyan-300 font-sans flex items-center gap-1.5 transition-colors"
                    >
                      <span>{asset.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        asset.type === "MODEL"
                          ? "bg-purple-950/60 text-purple-400 border-purple-800/60"
                          : "bg-cyan-950/60 text-cyan-400 border-cyan-800/60"
                      }`}
                    >
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {asset.volume}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                    {asset.accuracy}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">
                    {asset.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
