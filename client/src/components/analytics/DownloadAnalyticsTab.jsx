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
  DownloadCloud,
  HardDrive,
  Network,
  Share2,
  FileCode,
  ShieldCheck,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

export default function DownloadAnalyticsTab() {
  const egressHistory = [
    { date: "Oct 1", modelsGB: 1420, datasetsGB: 850, totalGB: 2270 },
    { date: "Oct 3", modelsGB: 1980, datasetsGB: 1120, totalGB: 3100 },
    { date: "Oct 6", modelsGB: 2450, datasetsGB: 1410, totalGB: 3860 },
    { date: "Oct 9", modelsGB: 2210, datasetsGB: 1680, totalGB: 3890 },
    { date: "Oct 12", modelsGB: 3410, datasetsGB: 2190, totalGB: 5600 },
    { date: "Oct 15", modelsGB: 4120, datasetsGB: 2840, totalGB: 6960 },
    { date: "Oct 18", modelsGB: 5290, datasetsGB: 3450, totalGB: 8740 },
  ];

  const topDownloadedAssets = [
    {
      title: "FinGPT-Alpha-v2.1 (FP16)",
      type: "Model Weights",
      cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      size: "14.2 GB",
      downloads: 412,
      bandwidth: "5.85 TB",
    },
    {
      title: "BioMed-Genomics-v4 Cleaned Corpus",
      type: "Dataset (Parquet)",
      cid: "QmZtmD2qt8fJpq3CLDHvdzsAAsNJ8n4cYXqVNffdNNqL55",
      size: "8.4 GB",
      downloads: 685,
      bandwidth: "5.75 TB",
    },
    {
      title: "CryptoSentiment-Stream-Q3 Tokenizer & Vectors",
      type: "Embeddings",
      cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      size: "1.8 GB",
      downloads: 1240,
      bandwidth: "2.23 TB",
    },
    {
      title: "NeuralVision-Edge-Lite (ONNX)",
      type: "Edge Quantized",
      cid: "QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukCa2WKDspY2G5",
      size: "450 MB",
      downloads: 2150,
      bandwidth: "0.96 TB",
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
              <span className="font-bold text-white">{entry.value.toLocaleString()} GB</span>
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
          <span className="text-xs font-mono text-slate-400 uppercase">30D Bandwidth Egress</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">148.4 TB</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-4 h-4" />
            <span>+34.2% vs last month</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Artifact Downloads</span>
          <div className="text-3xl font-extrabold text-white font-mono">18,490</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted IPFS payloads</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">IPFS Pinning Nodes</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">18 / 18</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Cluster Redundancy</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Integrity Verification</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">100%</div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>SHA-256 Merkle matched</span>
          </div>
        </div>
      </div>

      {/* Main Egress Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              IPFS Egress & Model Weight Distribution (GB / Day)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Decentralized storage payload delivery across global edge nodes
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Model Weights
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Datasets
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={egressHistory}>
              <defs>
                <linearGradient id="modelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="datasetsGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="modelsGB"
                name="Model Weights"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#modelsGrad)"
              />
              <Area
                type="monotone"
                dataKey="datasetsGB"
                name="Datasets"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#datasetsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Downloaded Assets */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            High-Throughput Distribution Assets
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Top downloaded neural weights and dataset packages by bandwidth consumed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Asset Name</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Content Identifier (CID)</th>
                <th className="pb-3 font-semibold">Package Size</th>
                <th className="pb-3 font-semibold">Total Downloads</th>
                <th className="pb-3 font-semibold text-right">Bandwidth Egress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topDownloadedAssets.map((asset, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    {asset.title}
                  </td>
                  <td className="py-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px]">
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px] truncate max-w-[200px]">
                    {asset.cid}
                  </td>
                  <td className="py-3 text-slate-300">{asset.size}</td>
                  <td className="py-3 font-bold text-cyan-400">{asset.downloads.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">{asset.bandwidth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
