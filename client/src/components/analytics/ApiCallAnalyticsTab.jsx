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
} from "recharts";
import {
  Terminal,
  Cpu,
  Zap,
  Gauge,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

export default function ApiCallAnalyticsTab() {
  const invocationTimeline = [
    { date: "Oct 1", calls: 4200, tokensK: 1250, avgLatency: 48 },
    { date: "Oct 3", calls: 5800, tokensK: 1820, avgLatency: 52 },
    { date: "Oct 6", calls: 7400, tokensK: 2410, avgLatency: 45 },
    { date: "Oct 9", calls: 6900, tokensK: 2150, avgLatency: 44 },
    { date: "Oct 12", calls: 9800, tokensK: 3200, avgLatency: 55 },
    { date: "Oct 15", calls: 12400, tokensK: 4100, avgLatency: 51 },
    { date: "Oct 18", calls: 15600, tokensK: 5400, avgLatency: 42 },
  ];

  const modelApiLeaderboard = [
    {
      model: "FinGPT-Alpha-v2.1",
      calls: "348,200",
      p50: "38 ms",
      p95: "112 ms",
      tokens: "128.4M",
      errorRate: "0.04%",
    },
    {
      model: "BioMed-Genomics-v4",
      calls: "215,800",
      p50: "64 ms",
      p95: "178 ms",
      tokens: "84.2M",
      errorRate: "0.08%",
    },
    {
      model: "CryptoSentiment-Stream-Q3",
      calls: "189,400",
      p50: "19 ms",
      p95: "58 ms",
      tokens: "45.0M",
      errorRate: "0.01%",
    },
    {
      model: "AutonomousNav-SensorFusion-v1",
      calls: "92,100",
      p50: "82 ms",
      p95: "210 ms",
      tokens: "31.6M",
      errorRate: "0.12%",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-800 font-mono text-xs shadow-2xl space-y-1">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total API Invocations</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">845,500</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-4 h-4" />
            <span>+41.8% this month</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">p50 Latency Benchmark</span>
          <div className="text-3xl font-extrabold text-white font-mono">42 ms</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Edge GPU accelerated</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">p99 Latency Tail</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">210 ms</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Strict SLA bounding</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">API Success Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">99.88%</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0.12% 4xx / 5xx</span>
          </div>
        </div>
      </div>

      {/* Latency & Invocations Time Series */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Daily Inference Invocations & Token Throughput
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Aggregated API requests and processed generative tokens
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Invocations
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Tokens (k)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={invocationTimeline}>
              <defs>
                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tokensGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                name="Invocations"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#callsGrad)"
              />
              <Area
                type="monotone"
                dataKey="tokensK"
                name="Tokens (k)"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tokensGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model API Leaderboard */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Model Inference Performance SLAs
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Latency percentiles and compute load metrics across deployed models
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Model Endpoint</th>
                <th className="pb-3 font-semibold">Total Invocations</th>
                <th className="pb-3 font-semibold">p50 Latency</th>
                <th className="pb-3 font-semibold">p95 Latency</th>
                <th className="pb-3 font-semibold">Tokens Streamed</th>
                <th className="pb-3 font-semibold text-right">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {modelApiLeaderboard.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    {item.model}
                  </td>
                  <td className="py-3 text-cyan-400 font-bold">{item.calls}</td>
                  <td className="py-3 text-emerald-400">{item.p50}</td>
                  <td className="py-3 text-yellow-400">{item.p95}</td>
                  <td className="py-3 text-slate-300">{item.tokens}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {item.errorRate}
                    </span>
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
