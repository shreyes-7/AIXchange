import React, { useState, useRef, useMemo } from "react";
import {
  Database,
  Cpu,
  Box,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hash,
  Clock,
  User,
  Layers,
  ArrowRight,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LineageDAGGraph({
  model = {},
  dataset = {},
  execution = {},
  inference = {},
  onSelectNode,
  selectedNodeId,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Node definitions based on active data
  const nodes = useMemo(() => {
    return [
      {
        id: "dataset",
        type: "DATASET_SOURCE",
        title: dataset.title || "Industrial IoT Sensor Telemetry",
        subtitle: `Dataset #${dataset.datasetId || 1} · IPFS Pin`,
        category: "Upstream Ingestion",
        icon: Database,
        accent: "cyan",
        borderColor: "border-cyan-500/40 hover:border-cyan-400",
        glowColor: "rgba(6, 182, 212, 0.15)",
        badgeColor: "bg-cyan-950/60 text-cyan-400 border-cyan-800/60",
        hashLabel: "IPFS CID",
        hashValue:
          dataset.cid ||
          "QmZtmD2qt8fJpq3CLDHtaGAsjP4PHYuW2Xu35g24sF41Qn",
        merkleRoot:
          "0x7c9f81a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
        metadata: {
          Format: "Parquet / CSV",
          "Sample Count": "150,000 vectors",
          "File Size": "18.4 MB",
          Owner: dataset.owner || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "Mint Block": "#19,842,104",
          "Block Timestamp": "2026-10-10 14:12:00 UTC",
        },
      },
      {
        id: "execution",
        type: "SANDBOX_COMPUTE",
        title: "Docker Sandbox Training Run",
        subtitle: `Job ${execution.executionId || "#exec-8092"} · Linux x86_64`,
        category: "Model Optimization",
        icon: Cpu,
        accent: "purple",
        borderColor: "border-purple-500/40 hover:border-purple-400",
        glowColor: "rgba(168, 85, 247, 0.15)",
        badgeColor: "bg-purple-950/60 text-purple-400 border-purple-800/60",
        hashLabel: "Execution Hash",
        hashValue:
          execution.executionHash ||
          "0x9d4a8e2b6c1f0e7d5c3b2a1f8e9d6c4b2a0f8e6d4c2b0a8f6e4d2b0a8f6e4d2b",
        merkleRoot: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
        metadata: {
          Runtime: "PyTorch 2.4.0 (CUDA 12.4)",
          Hyperparameters: "Epochs: 10, Batch: 32, LR: 0.001",
          Optimizer: "AdamW (decay=1e-4)",
          "Final Loss": "0.0412 (Cross-Entropy)",
          "Container ID": "sha256:7b91d4e0ca...",
          "Execution Duration": "4m 18s",
        },
      },
      {
        id: "model",
        type: "MODEL_ARTIFACT",
        title: model.name || "DeepPulse ResNet-Telemetry Anomaly Predictor",
        subtitle: `Model #${model.modelId || 1} · ${model.framework || "PyTorch"}`,
        category: "Cryptographic Checkpoint",
        icon: Box,
        accent: "emerald",
        borderColor: "border-emerald-500/40 hover:border-emerald-400",
        glowColor: "rgba(16, 185, 129, 0.15)",
        badgeColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
        hashLabel: "Safetensors SHA-256",
        hashValue:
          model.modelHash ||
          "569fd95a0b6c30bf06b1368d42e36930873b683259b751edd8fab45c2b2728c2",
        merkleRoot: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
        metadata: {
          Architecture: model.architecture || "ResNet-18 (1D Conv)",
          Parameters: model.parameters || "11.2M",
          Accuracy: model.accuracy || "98.42%",
          Format: model.format || "Safetensors (.safetensors)",
          "Anchored Registry": "ModelRegistry.sol",
          "Verification Status": "VERIFIED_ON_CHAIN",
        },
      },
      {
        id: "inference",
        type: "ATTESTATION_RECEIPT",
        title: "Inference Attestation Proof",
        subtitle: `Forward-Pass Nonce · Zero-Leakage`,
        category: "Decentralized Execution",
        icon: ShieldCheck,
        accent: "blue",
        borderColor: "border-blue-500/40 hover:border-blue-400",
        glowColor: "rgba(59, 130, 246, 0.15)",
        badgeColor: "bg-blue-950/60 text-blue-400 border-blue-800/60",
        hashLabel: "Execution Nonce Receipt",
        hashValue:
          inference.receiptHash ||
          "0xddc707d3819757ab2362b666b76fdc522067755ba3d3dafdcb662d5392e2ca1c",
        merkleRoot: "0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e",
        metadata: {
          Status: "NOMINAL_HEALTHY / ATTESTED",
          Latency: "14.2ms (Micro-benchmark)",
          Anchor: "ProvenanceRegistry.sol",
          Consensus: "EVM Smart Contract Signed",
          "Block Confirmation": "Finalized (12 blocks)",
        },
      },
    ];
  }, [dataset, execution, model, inference]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  return (
    <div className="space-y-6">
      {/* Canvas Container */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Subtle Background Circuit Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.25) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Lineage DAG Pipeline
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-cyan-400">
              4 Nodes · 3 Directed Edges
            </span>
          </div>

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-cyan-400 font-bold select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1 border-l border-slate-800 pl-2"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nodes Grid with Flow Connectors */}
        <div
          className="relative z-10 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {nodes.map((node, index) => {
              const IconComp = node.icon;
              const isSelected = selectedNodeId === node.id;

              return (
                <div key={node.id} className="relative flex flex-col">
                  {/* Flow Arrow (Desktop) */}
                  {index < nodes.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-lg">
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Node Card */}
                  <div
                    onClick={() => onSelectNode && onSelectNode(node.id)}
                    className={`flex-1 p-5 rounded-2xl bg-slate-950/85 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-500/10"
                        : `${node.borderColor} shadow-black/40`
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 25px ${node.glowColor}`
                        : undefined,
                    }}
                  >
                    {/* Top Row: Type Tag & Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${node.badgeColor}`}
                      >
                        {node.category}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-${node.accent}-400`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                        {node.title}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {node.subtitle}
                      </p>
                    </div>

                    {/* Cryptographic Digest Box */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{node.hashLabel}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(node.hashValue, node.id);
                          }}
                          className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                        >
                          {copiedKey === node.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-cyan-300 truncate">
                        {node.hashValue.slice(0, 16)}...{node.hashValue.slice(-8)}
                      </div>
                    </div>

                    {/* Bottom Status Indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Anchored</span>
                      </span>
                      <span className="text-slate-500 hover:text-cyan-400 flex items-center gap-0.5 transition-colors">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer / Card */}
      {activeNode && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-950 border border-slate-800 text-${activeNode.accent}-400`}
              >
                {React.createElement(activeNode.icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {activeNode.title}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activeNode.badgeColor}`}
                  >
                    {activeNode.type}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  {activeNode.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cryptographically Validated
              </span>
            </div>
          </div>

          {/* Cryptographic Identifiers Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px]">
                <span>{activeNode.hashLabel}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeNode.hashValue, "activeHash")}
                  className="hover:text-cyan-400 text-slate-400 flex items-center gap-1"
                >
                  {copiedKey === "activeHash" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-cyan-300 break-all select-all font-mono text-[11px]">
                {activeNode.hashValue}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px]">
                <span>Merkle Lineage Root</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeNode.merkleRoot, "activeMerkle")
                  }
                  className="hover:text-cyan-400 text-slate-400 flex items-center gap-1"
                >
                  {copiedKey === "activeMerkle" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-indigo-300 break-all select-all font-mono text-[11px]">
                {activeNode.merkleRoot}
              </div>
            </div>
          </div>

          {/* Technical Metadata Key-Value Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(activeNode.metadata).map(([key, value]) => (
              <div
                key={key}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono"
              >
                <span className="text-[10px] text-slate-500 block truncate">
                  {key}
                </span>
                <span className="text-xs font-semibold text-slate-200 block truncate mt-0.5">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
