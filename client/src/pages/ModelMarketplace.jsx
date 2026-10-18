import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Search,
  Sparkles,
  ShieldCheck,
  Plus,
  Layers,
  Database,
  Filter,
  RefreshCw,
  Box,
  Play,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { ModelCard } from "../components/model";
import { fetchModels } from "../services/api/modelApi.service";
import { getAllModels } from "../services/blockchain/model/model.service";
import { getAllStoredModelMetadata, getModelMetadata } from "../services/modelMetadata";

export default function ModelMarketplace() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      // Fetch metadata store as baseline
      const metaMap = getAllStoredModelMetadata();
      const baseModels = Object.values(metaMap);

      // Attempt to load from API or on-chain
      try {
        const onChain = await getAllModels();
        if (Array.isArray(onChain) && onChain.length > 0) {
          const enriched = onChain.map((m) => {
            const meta = getModelMetadata(m.modelId);
            return {
              ...meta,
              modelId: m.modelId,
              name: m.name || meta.name,
              owner: m.owner || meta.owner,
              active: m.active !== undefined ? m.active : true,
            };
          });
          setModels(enriched);
          return;
        }
      } catch {
        // use baseModels
      }

      setModels(baseModels);
    } catch (err) {
      console.warn("Failed to load models:", err);
      setModels(Object.values(getAllStoredModelMetadata()));
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      // Framework filter
      if (
        selectedFramework !== "ALL" &&
        !(m.framework || "").toLowerCase().includes(selectedFramework.toLowerCase())
      ) {
        return false;
      }
      // Category filter
      if (
        selectedCategory !== "ALL" &&
        !(m.category || "").toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (m.name || "").toLowerCase().includes(q);
        const matchesArch = (m.architecture || "").toLowerCase().includes(q);
        const matchesHash = (m.modelHash || "").toLowerCase().includes(q);
        const matchesDesc = (m.description || "").toLowerCase().includes(q);
        return matchesName || matchesArch || matchesHash || matchesDesc;
      }
      return true;
    });
  }, [models, selectedFramework, selectedCategory, search]);

  const frameworks = ["ALL", "PyTorch", "Safetensors", "ONNX", "Transformers"];
  const categories = ["ALL", "Time Series & IoT", "Natural Language & Sequences", "Computer Vision"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Deck */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              VERIFIED NEURAL WEIGHT REGISTRY · IMMUTABLE SHA-256 ATTESTATION
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Model Marketplace
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Discover, download, and verify deep learning models trained in isolated Docker sandboxes.
              Every neural weight artifact is anchored to the Ethereum ModelRegistry with verifiable checksums.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/models/register">
              <Button variant="cyber" icon={<Plus className="w-4 h-4" />}>
                Register Model Weights
              </Button>
            </Link>
            <button
              onClick={loadModels}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh models"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Marketplace Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
            <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Verified Models</span>
            <span className="text-xl font-bold text-white">{models.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
            <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Weight Format</span>
            <span className="text-xl font-bold text-cyan-400">Safetensors / ONNX</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
            <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Avg Accuracy</span>
            <span className="text-xl font-bold text-emerald-400">98.4%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
            <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Inference Ready</span>
            <span className="text-xl font-bold text-indigo-400">100% Decoupled</span>
          </div>
        </div>

        {/* Search & Multi-Tier Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by model name, architecture (e.g. ResNet, MLP), or SHA-256 hash..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Direct Inference Link */}
            <Link to="/inference">
              <Button
                variant="secondary"
                icon={<Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />}
              >
                Inference Studio
              </Button>
            </Link>
          </div>

          {/* Framework & Domain Filter Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            {/* Framework Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" /> Stack:
              </span>
              {frameworks.map((fw) => (
                <button
                  key={fw}
                  onClick={() => setSelectedFramework(fw)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                    selectedFramework === fw
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Domain:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat === "ALL" ? "All Domains" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500 font-mono text-xs space-y-3">
            <Cpu className="w-10 h-10 text-slate-700 mx-auto" />
            <p>No verified AI models found matching your current filter selection.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedFramework("ALL");
                setSelectedCategory("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <ModelCard key={model.modelId} model={model} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
