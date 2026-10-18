import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Coins, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";

export default function RevenueAnalyticsTab() {
  const timeSeriesData = [
    { date: "Oct 1", models: 1800, datasets: 1200, compute: 450, total: 3450 },
    { date: "Oct 3", models: 2400, datasets: 1600, compute: 600, total: 4600 },
    { date: "Oct 6", models: 3100, datasets: 1900, compute: 850, total: 5850 },
    { date: "Oct 9", models: 2900, datasets: 2100, compute: 900, total: 5900 },
    { date: "Oct 12", models: 4200, datasets: 2800, compute: 1200, total: 8200 },
    { date: "Oct 15", models: 5100, datasets: 3400, compute: 1550, total: 10050 },
    { date: "Oct 18", models: 6400, datasets: 4100, compute: 1900, total: 12400 },
  ];

  const categoryShare = [
    { name: "Model Checkpoints", value: 78400, fill: "#06b6d4" },
    { name: "Dataset Licenses", value: 62100, fill: "#6366f1" },
    { name: "Sandbox Compute", value: 31500, fill: "#a855f7" },
    { name: "Inference Fees", value: 12950, fill: "#10b981" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-800 font-mono text-xs shadow-2xl space-y-1">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-white">{entry.value.toLocaleString()} AIX</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Gross Merchandise Value (GMV)
          </span>
          <div className="text-3xl font-extrabold text-white font-mono">
            184,950.00 AIX
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +28.4% monthly expansion
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Average Transaction Value (AOV)
          </span>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            428.12 AIX
          </div>
          <span className="text-xs font-mono text-slate-400">
            Across 432 settled transactions
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Protocol Net Take (2.50%)
          </span>
          <div className="text-3xl font-extrabold text-purple-300 font-mono">
            4,623.75 AIX
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Zero-Leakage Dust Verified
          </span>
        </div>
      </div>

      {/* Primary Chart: Time-Series Revenue Area Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Platform Revenue Inflow Over Time
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              Daily gross sales volume across neural models, dataset licenses, and compute runtimes.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs">
            Units: AIX Tokens
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="modelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="datasetsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="computeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "12px" }} />
              <Area type="monotone" dataKey="models" name="Models" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#modelsGrad)" />
              <Area type="monotone" dataKey="datasets" name="Datasets" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#datasetsGrad)" />
              <Area type="monotone" dataKey="compute" name="Compute" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#computeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
