import React from "react";
import {
  Database,
  Cpu,
  Box,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default function LineageTimeline({ model = {}, dataset = {}, events = [] }) {
  // Deterministic chronological events list
  const timelineEvents = events.length > 0 ? events : [
    {
      id: "evt-1",
      title: "Dataset Ingestion & Merkle Tree Root Minted",
      subtitle: dataset.title || "Industrial IoT Sensor Telemetry",
      type: "DATASET_REGISTRATION",
      category: "Data Layer",
      icon: Database,
      accent: "cyan",
      blockNumber: "19,842,104",
      txHash: "0x8a92f0c1d2e3b4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
      timestamp: "2026-10-10 14:12:00 UTC",
      gasUsed: "142,850 gas",
      details: `150,000 telemetry sensor rows pinned to IPFS CID (${dataset.cid ? dataset.cid.slice(0, 16) + '...' : 'QmZtmD2q...'}) with SHA-256 Merkle root verification.`,
    },
    {
      id: "evt-2",
      title: "Docker Sandbox Compute Container Dispatched",
      subtitle: "Job #exec-8092 · PyTorch 2.4.0 (CUDA 12.4)",
      type: "TRAINING_INITIALIZATION",
      category: "Execution Substrate",
      icon: Cpu,
      accent: "purple",
      blockNumber: "19,842,180",
      txHash: "0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
      timestamp: "2026-10-10 14:18:22 UTC",
      gasUsed: "88,210 gas",
      details: "Isolated container instantiated. Consumed 5-channel feature tensors for 10 epochs. Achieved final convergence loss of 0.0412.",
    },
    {
      id: "evt-3",
      title: "Neural Network Weights Checkpointed & Hashed",
      subtitle: `${model.name || "DeepPulse ResNet"} · Safetensors (.safetensors)`,
      type: "WEIGHT_CHECKPOINT",
      category: "Model Registry",
      icon: Box,
      accent: "emerald",
      blockNumber: "19,842,245",
      txHash: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
      timestamp: "2026-10-10 14:24:50 UTC",
      gasUsed: "189,400 gas",
      details: `Model weights serialized in memory and hashed with SHA-256 (${(model.modelHash || "569fd95a0b6...").slice(0, 18)}...). Anchored to ModelRegistry.sol.`,
    },
    {
      id: "evt-4",
      title: "Lineage Relationship Anchored in ProvenanceRegistry.sol",
      subtitle: "Event: ProvenanceRegistered · Record #1",
      type: "PROVENANCE_MINT",
      category: "Smart Contract Consensus",
      icon: ShieldCheck,
      accent: "blue",
      blockNumber: "19,842,290",
      txHash: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
      timestamp: "2026-10-10 14:30:15 UTC",
      gasUsed: "115,320 gas",
      details: "Immutable smart-contract commitment linking Dataset #1 and Model #1 with cryptographic metadataHash verification.",
    },
    {
      id: "evt-5",
      title: "Live Zero-Leakage Inference Nonce Issued",
      subtitle: "Attestation Receipt · EVM State Signed",
      type: "INFERENCE_ATTESTATION",
      category: "Runtime Verification",
      icon: CheckCircle2,
      accent: "amber",
      blockNumber: "19,842,315",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      timestamp: "2026-10-10 14:35:40 UTC",
      gasUsed: "42,100 gas",
      details: "Forward-pass prediction executed in <15ms latency. Nonce verified against anchored safetensors weight digest.",
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Clock className="w-4 h-4 text-cyan-400" />
            CHRONOLOGICAL ON-CHAIN EVENT STREAM
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Cryptographic Lineage Timeline
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Deterministic sequence of smart contract transactions anchoring data, training, checkpoints, and inference.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            Total Milestones: <strong className="text-cyan-300">{timelineEvents.length}</strong>
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
        {timelineEvents.map((evt, idx) => {
          const IconComp = evt.icon;
          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-${evt.accent}-400 flex items-center justify-center text-${evt.accent}-400 shadow-md group-hover:scale-110 transition-transform`}
              >
                <div className={`w-2 h-2 rounded-full bg-${evt.accent}-400`} />
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      Step #{idx + 1}
                    </span>
                    <span className="text-slate-600">·</span>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {evt.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Block #{evt.blockNumber}
                    </span>
                    <span>{evt.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {evt.details}
                </p>

                {/* Bottom Metadata Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2 truncate max-w-sm">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-400 truncate">
                      Tx: <code className="text-cyan-300">{evt.txHash.slice(0, 16)}...{evt.txHash.slice(-8)}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span>Gas: <strong className="text-slate-300">{evt.gasUsed}</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
