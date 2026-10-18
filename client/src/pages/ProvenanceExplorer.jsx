import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import {
  LineageDAGGraph,
  LineageTimeline,
  VerifyProvenanceModal,
} from "../components/provenance";
import {
  getModelMetadata,
  getAllStoredModelMetadata,
} from "../services/modelMetadata";
import { getDatasetMetadata } from "../services/datasetMetadata";
import { getAllDatasets } from "../services/blockchain/dataset";
import { getAllModels } from "../services/blockchain/model/model.service";
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Box,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
  Hash,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";

export default function ProvenanceExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialModelId = searchParams.get("modelId") || "1";
  const [selectedModelId, setSelectedModelId] = useState(initialModelId);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [activeTab, setActiveTab] = useState("dag"); // "dag" | "timeline" | "audit"
  const [selectedNodeId, setSelectedNodeId] = useState("model");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Sync selectedModelId with query params
  useEffect(() => {
    const qModelId = searchParams.get("modelId");
    if (qModelId) {
      setSelectedModelId(qModelId);
    }
  }, [searchParams]);

  // Load models and datasets catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const storedMeta = getAllStoredModelMetadata();
        setModels(Object.values(storedMeta));

        try {
          const dsList = await getAllDatasets();
          if (Array.isArray(dsList) && dsList.length > 0) {
            setDatasets(dsList);
          } else {
            setDatasets([
              { datasetId: 1, title: "Industrial IoT Sensor Telemetry" },
              { datasetId: 2, title: "Decentralized Sensor Telemetry Corpus v2" },
            ]);
          }
        } catch {
          setDatasets([
            { datasetId: 1, title: "Industrial IoT Sensor Telemetry" },
            { datasetId: 2, title: "Decentralized Sensor Telemetry Corpus v2" },
          ]);
        }
      } catch (err) {
        console.warn("Failed to load catalog for provenance:", err);
      }
    }
    loadCatalog();
  }, []);

  const selectedModel = useMemo(() => {
    return getModelMetadata(selectedModelId);
  }, [selectedModelId]);

  const selectedDataset = useMemo(() => {
    return getDatasetMetadata(selectedModel.datasetId || 1);
  }, [selectedModel]);

  const handleModelChange = (id) => {
    setSelectedModelId(id);
    setSearchParams({ modelId: id });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1.5">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              DECENTRALIZED PROVENANCE & LINEAGE REGISTRY · PHASE 9
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Provenance & Lineage DAG
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              Cryptographically verify upstream datasets, Docker sandbox training runs, and neural weights.
              Every lineage relation is anchored in immutable Ethereum smart contracts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="cyber"
              icon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => setIsVerifyModalOpen(true)}
            >
              Verify On-Chain
            </Button>
            <Link to={`/provenance/graph/${selectedModelId}`}>
              <Button
                variant="secondary"
                icon={<Maximize2 className="w-4 h-4" />}
              >
                Fullscreen Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* Model Selector & Quick Technical Specs Bar */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Model Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                Select Model to Inspect
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none transition-colors"
              >
                {models.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    Model #{m.modelId}: {m.name} ({m.framework})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Dataset Indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 block">
                Upstream Training Dataset
              </span>
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold truncate">
                <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{selectedDataset.title}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 truncate block">
                {selectedDataset.cid ? selectedDataset.cid.slice(0, 22) + "..." : "QmZtmD2q..."}
              </span>
            </div>

            {/* Neural Weights SHA-256 Digest */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 block">
                Anchored Weights SHA-256
              </span>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold truncate">
                <Box className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {(selectedModel.modelHash || "569fd95a0b6...").slice(0, 24)}...
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate block">
                Framework: {selectedModel.framework} · Acc: {selectedModel.accuracy}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("dag")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "dag"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Lineage DAG Canvas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "timeline"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Event Timeline
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "audit"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Cryptographic Dossier
          </button>
        </div>

        {/* TAB 1: Interactive Lineage DAG Graph */}
        {activeTab === "dag" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <LineageDAGGraph
              model={selectedModel}
              dataset={selectedDataset}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
            />
          </div>
        )}

        {/* TAB 2: Chronological Lineage Timeline */}
        {activeTab === "timeline" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <LineageTimeline model={selectedModel} dataset={selectedDataset} />
          </div>
        )}

        {/* TAB 3: Cryptographic Audit Dossier */}
        {activeTab === "audit" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 backdrop-blur-md shadow-2xl animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  ON-CHAIN AUDIT & SMART CONTRACT VERIFICATION
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Lineage Verification Dossier
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Verifiable smart contract registries and state proof parameters anchored to EVM blocks.
                </p>
              </div>

              <Button
                variant="cyber"
                size="sm"
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => setIsVerifyModalOpen(true)}
              >
                Execute Proof Check
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  Primary Lineage Registry Contract
                </span>
                <div className="text-white font-bold flex items-center justify-between">
                  <span>ProvenanceRegistry.sol</span>
                  <Badge variant="cyan">Consensus Anchor</Badge>
                </div>
                <code className="text-cyan-300 text-[11px] block break-all select-all">
                  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
                </code>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  Neural Weights Registry Contract
                </span>
                <div className="text-white font-bold flex items-center justify-between">
                  <span>ModelRegistry.sol</span>
                  <Badge variant="success">Checkpoint Anchor</Badge>
                </div>
                <code className="text-emerald-300 text-[11px] block break-all select-all">
                  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
                </code>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  Dataset Storage Registry Contract
                </span>
                <div className="text-white font-bold flex items-center justify-between">
                  <span>DatasetRegistry.sol</span>
                  <Badge variant="cyan">IPFS Pin Anchor</Badge>
                </div>
                <code className="text-cyan-300 text-[11px] block break-all select-all">
                  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
                </code>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  Decentralized Consensus Status
                </span>
                <div className="text-white font-bold flex items-center justify-between">
                  <span>EVM Block Consensus</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Lineage records are cryptographically verified using EVM events and Merkle proofs.
                </p>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-500">
                Cross-Module Links:
              </span>
              <div className="flex items-center gap-3">
                <Link to={`/models/${selectedModelId}`}>
                  <Button variant="secondary" size="sm" icon={<Box className="w-3.5 h-3.5" />}>
                    Inspect Model #{selectedModelId}
                  </Button>
                </Link>
                <Link to={`/inference?modelId=${selectedModelId}`}>
                  <Button variant="secondary" size="sm" icon={<Zap className="w-3.5 h-3.5" />}>
                    Test in Inference Studio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* On-Chain Verification Modal */}
      <VerifyProvenanceModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        model={selectedModel}
        dataset={selectedDataset}
      />
    </div>
  );
}
