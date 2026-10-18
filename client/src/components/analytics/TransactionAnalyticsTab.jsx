import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function TransactionAnalyticsTab() {
  const [filterType, setFilterType] = useState("all");

  const txVolumeData = [
    { date: "Oct 1", purchases: 142, royalties: 88, inferences: 420 },
    { date: "Oct 3", purchases: 189, royalties: 112, inferences: 560 },
    { date: "Oct 6", purchases: 245, royalties: 165, inferences: 780 },
    { date: "Oct 9", purchases: 210, royalties: 140, inferences: 690 },
    { date: "Oct 12", purchases: 320, royalties: 220, inferences: 1150 },
    { date: "Oct 15", purchases: 410, royalties: 295, inferences: 1420 },
    { date: "Oct 18", purchases: 495, royalties: 360, inferences: 1890 },
  ];

  const statusDistribution = [
    { name: "Confirmed", value: 14820, color: "#10b981" },
    { name: "Pending", value: 180, color: "#f59e0b" },
    { name: "Failed / Reverted", value: 45, color: "#ef4444" },
  ];

  const recentTxStream = [
    {
      hash: "0x7f9a...3c21",
      method: "executePurchase",
      asset: "FinGPT-Alpha-v2.1",
      amount: "4,500 AIX",
      gasUsed: "142,850",
      status: "Confirmed",
      time: "2 mins ago",
    },
    {
      hash: "0x4b12...8e90",
      method: "distributeRoyalty",
      asset: "BioMed-Genomics-v4",
      amount: "450 AIX",
      gasUsed: "98,120",
      status: "Confirmed",
      time: "5 mins ago",
    },
    {
      hash: "0x89dc...001a",
      method: "recordProvenanceCommit",
      asset: "NeuralVision-Edge-Lite",
      amount: "0 AIX",
      gasUsed: "64,200",
      status: "Confirmed",
      time: "11 mins ago",
    },
    {
      hash: "0x22ef...91ba",
      method: "invokeInferenceReceipt",
      asset: "CryptoSentiment-Stream-Q3",
      amount: "25 AIX",
      gasUsed: "48,300",
      status: "Confirmed",
      time: "16 mins ago",
    },
    {
      hash: "0x98aa...4412",
      method: "executePurchase",
      asset: "AutonomousNav-SensorFusion-v1",
      amount: "8,900 AIX",
      gasUsed: "155,200",
      status: "Confirmed",
      time: "24 mins ago",
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
              <span className="font-bold text-white">{entry.value.toLocaleString()} txs</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Settled Txs</span>
          <div className="text-3xl font-extrabold text-white font-mono">15,045</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-4 h-4" />
            <span>+28.4% this month</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Success Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">99.70%</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>45 reverted / 15k</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Avg Confirmation Time</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">2.1s</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Local Hardhat / Sub-second</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Avg Gas / Settlement</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">112k</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>EIP-1559 optimized</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Volume Over Time */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                On-Chain Transaction Volume
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Daily count categorized by transaction contract method
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="flex items-center gap-1 px-2 py-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Purchases
              </span>
              <span className="flex items-center gap-1 px-2 py-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Royalties
              </span>
              <span className="flex items-center gap-1 px-2 py-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Inferences
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="purchases" name="Purchases" fill="#06b6d4" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="royalties" name="Royalties" fill="#a855f7" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="inferences" name="Inferences" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Settlement Status
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Execution finality & safety ratios
            </p>
          </div>

          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val.toLocaleString()} txs`, name]}
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
              <span className="text-2xl font-black text-white font-mono">99.7%</span>
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Health</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Transaction Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Recent On-Chain Activity Stream
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live immutable EVM state changes recorded across AIX smart contracts
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Streaming
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Tx Hash</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Target Asset</th>
                <th className="pb-3 font-semibold">Value</th>
                <th className="pb-3 font-semibold">Gas Used</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTxStream.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-cyan-400 font-semibold flex items-center gap-1">
                    {tx.hash}
                    <ExternalLink className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-pointer" />
                  </td>
                  <td className="py-3 text-purple-400">{tx.method}</td>
                  <td className="py-3 text-slate-200">{tx.asset}</td>
                  <td className="py-3 font-bold text-white">{tx.amount}</td>
                  <td className="py-3 text-slate-400">{tx.gasUsed}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-500">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
