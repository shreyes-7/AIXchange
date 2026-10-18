import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Layers,
  Fuel,
  Cpu,
  Coins,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";

export default function BlockchainAnalyticsTab() {
  const gasTrends = [
    { blockRange: "0-200", baseFeeGwei: 1.2, priorityFeeGwei: 0.2 },
    { blockRange: "201-400", baseFeeGwei: 1.5, priorityFeeGwei: 0.3 },
    { blockRange: "401-600", baseFeeGwei: 2.1, priorityFeeGwei: 0.5 },
    { blockRange: "601-800", baseFeeGwei: 1.8, priorityFeeGwei: 0.4 },
    { blockRange: "801-1000", baseFeeGwei: 2.6, priorityFeeGwei: 0.6 },
    { blockRange: "1001-1200", baseFeeGwei: 3.2, priorityFeeGwei: 0.8 },
    { blockRange: "1201-1400", baseFeeGwei: 2.4, priorityFeeGwei: 0.4 },
  ];

  const contractGasShare = [
    { name: "MarketplaceCore", gas: "4.8M", share: 38, color: "#06b6d4" },
    { name: "RoyaltyEngine", gas: "3.2M", share: 26, color: "#a855f7" },
    { name: "ProvenanceRegistry", gas: "2.6M", share: 21, color: "#10b981" },
    { name: "EscrowVault", gas: "1.9M", share: 15, color: "#f59e0b" },
  ];

  const tokenVelocityData = [
    { category: "In Circulating Wallets", amount: "420,000 AIX", percentage: "42%" },
    { category: "Locked in Escrow Smart Contracts", amount: "280,000 AIX", percentage: "28%" },
    { category: "Creator Royalty Reserves", amount: "185,000 AIX", percentage: "18.5%" },
    { category: "Staked Governance & Compute Pool", amount: "115,000 AIX", percentage: "11.5%" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-800 font-mono text-xs shadow-2xl space-y-1">
          <p className="font-bold text-white mb-1">Block Range: {label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-white">{entry.value} Gwei</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Blockchain KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Current Gas Price</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">2.4 Gwei</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <Fuel className="w-3.5 h-3.5" />
            <span>Optimal network conditions</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Gas Consumed</span>
          <div className="text-3xl font-extrabold text-white font-mono">12.5M units</div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>Across 4 Core Contracts</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Active EVM Chain</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">Hardhat #31337</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Local RPC node synchronized</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Token Velocity Index</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">3.8x / mo</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>High turnover liquidity</span>
          </div>
        </div>
      </div>

      {/* Gas Chart & Contract Share Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gas Price Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Gas Price & Base Fee Fluctuation (Gwei)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                EIP-1559 base fee vs priority tip across recent block batches
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="flex items-center gap-1 px-2 py-0.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Base Fee
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Priority Fee
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gasTrends}>
                <defs>
                  <linearGradient id="baseFeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="priorityFeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="blockRange" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="baseFeeGwei"
                  name="Base Fee"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#baseFeeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="priorityFeeGwei"
                  name="Priority Fee"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#priorityFeeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Contract Gas Share */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Contract Gas Consumption
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Breakdown by on-chain contract module
            </p>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractGasShare}
                  dataKey="share"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {contractGasShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val}% of total gas`, name]}
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white font-mono">12.5M</span>
              <span className="text-[10px] text-cyan-400 uppercase font-mono">Gas Units</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {contractGasShare.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{item.gas}</span>
                  <span className="font-bold text-white">{item.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AIX Token Velocity & Capital Distribution */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            AIX Token Velocity & Vault Reserves
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Liquidity distribution across escrow mechanisms, royalty reserves, and active wallets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {tokenVelocityData.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 font-mono"
            >
              <div className="text-[11px] text-slate-400 leading-tight">{item.category}</div>
              <div className="text-lg font-bold text-white">{item.amount}</div>
              <div className="text-xs text-cyan-400 font-semibold">{item.percentage} of pool</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
