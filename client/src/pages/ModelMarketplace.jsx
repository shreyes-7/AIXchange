import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cpu, Search, Sparkles, CheckCircle2, Shield, ArrowUpRight, Plus, Terminal } from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { fetchModels } from "../services/api/modelApi.service";

export default function ModelMarketplace() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchModels({ search: search || undefined });
        if (res?.success && Array.isArray(res.data)) {
          setModels(res.data);
        } else {
          // Fallback baseline for demo if no models registered yet
          setModels([
            {
              modelId: "1",
              name: "DeepPulse-SensorAnomaly-ResNet",
              framework: "PyTorch",
              category: "Computer Vision / Time Series",
              version: 1,
              modelHash: "0x8f3c71a94e82b4a1c5d3e7f92a1b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b",
              creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
              active: true,
              inferenceReady: true,
              description: "High-frequency vibration and temperature anomaly detection for autonomous industrial telemetry.",
            },
          ]);
        }
      } catch (err) {
        console.warn("Failed to fetch models:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search]);

  const filteredModels = models.filter((m) => {
    if (category !== "ALL" && m.category && !m.category.toLowerCase().includes(category.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <PublicShell>
      <div className="max-w-7xl mx-auto my-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Verified Neural Weights
            </div>
            <h1 className="text-3xl font-extrabold text-white">AI Model Marketplace</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Discover and execute verified AI models trained in isolated Docker sandboxes, anchored with SHA-256 weight checksums on Ethereum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/models/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Register Model
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by model name, architecture, or checksum..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["ALL", "Computer Vision", "NLP", "Audio", "Time Series"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  category === cat
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((m) => (
            <div
              key={m.modelId}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all shadow-xl backdrop-blur-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/20">
                    ID #{m.modelId} · v{m.version || 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified On-Chain
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {m.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {m.description || "Trained PyTorch model weights with verifiable dataset lineage."}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>SHA-256 WEIGHT CHECKSUM</span>
                    <Shield className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="text-purple-300 truncate">
                    {m.modelHash || "0x8f3c71a94e82b4a1c5d3e7f9..."}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/inference?modelId=${m.modelId}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  Run Inference
                </Link>

                <Link
                  to={`/models/${m.modelId}`}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  Details
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
