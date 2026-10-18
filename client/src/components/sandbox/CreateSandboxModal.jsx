import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Badge from "../common/Badge";
import { Box, Cpu, HardDrive, ShieldCheck, Database, Layers, Sparkles } from "lucide-react";

export default function CreateSandboxModal({
  isOpen,
  onClose,
  onCreate,
  availableDatasets = [],
  isCreating = false,
}) {
  const [name, setName] = useState("Industrial IoT Telemetry Sandbox");
  const [datasetId, setDatasetId] = useState(
    availableDatasets.length > 0 ? availableDatasets[0].datasetId : "1"
  );
  const [profile, setProfile] = useState("heavy"); // "standard" | "heavy" | "turbo"
  const [runtime, setRuntime] = useState("pytorch"); // "pytorch" | "tabular" | "transformers"

  const profiles = {
    standard: {
      cpu: "2.0 Cores",
      memory: "4096 MB",
      gpu: "None (CPU only)",
      label: "Standard CPU",
    },
    heavy: {
      cpu: "4.0 Cores",
      memory: "8192 MB",
      gpu: "NVIDIA CUDA 12.1",
      label: "High Compute (GPU Recommended)",
    },
    turbo: {
      cpu: "8.0 Cores",
      memory: "16384 MB",
      gpu: "Tensor Core Accelerator",
      label: "Turbo Research",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      name,
      datasetId: parseInt(datasetId, 10) || 1,
      profile,
      resources: profiles[profile],
      runtime,
    });
  };

  const selectedDataset = availableDatasets.find(
    (d) => String(d.datasetId) === String(datasetId)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Air-Gapped Container"
      description="Launch a zero-leakage ephemeral Docker / gVisor container anchored to your licensed dataset."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sandbox Identifier */}
        <div>
          <Input
            label="Sandbox Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Telemetry Deep Learning Sandbox"
            required
            helperText="Human-readable identifier for your isolated JupyterLab and training substrate."
          />
        </div>

        {/* Bound Dataset Selector */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Bind Licensed Dataset
            </span>
            <span className="text-[10px] text-slate-500">Read-Only Volume Mount</span>
          </label>
          <select
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-cyan-500 focus:outline-none transition-colors"
          >
            {availableDatasets.map((d) => (
              <option key={d.datasetId} value={d.datasetId}>
                Dataset #{d.datasetId} — {d.title} ({d.category || "Dataset"})
              </option>
            ))}
          </select>
          {selectedDataset && (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Mounted at <code className="text-cyan-400 font-bold">/workspace/input/dataset_{datasetId}.csv</code> with AES-256 on-the-fly decryption.
            </p>
          )}
        </div>

        {/* Compute Resource Sizing */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Compute Resource Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(profiles).map(([key, info]) => {
              const isSelected = profile === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setProfile(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{info.label}</span>
                    {key === "heavy" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>{info.cpu}</div>
                    <div>{info.memory} RAM</div>
                    <div className="text-[10px] text-slate-500 truncate">{info.gpu}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Runtime Environment Profile */}
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Runtime Environment Stack
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <label
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                runtime === "pytorch"
                  ? "bg-purple-950/30 border-purple-500 text-purple-200"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="runtime"
                checked={runtime === "pytorch"}
                onChange={() => setRuntime("pytorch")}
                className="hidden"
              />
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>PyTorch 2.4.0</span>
            </label>

            <label
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                runtime === "tabular"
                  ? "bg-purple-950/30 border-purple-500 text-purple-200"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="runtime"
                checked={runtime === "tabular"}
                onChange={() => setRuntime("tabular")}
                className="hidden"
              />
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Scikit-Learn/XGB</span>
            </label>

            <label
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                runtime === "transformers"
                  ? "bg-purple-950/30 border-purple-500 text-purple-200"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="runtime"
                checked={runtime === "transformers"}
                onChange={() => setRuntime("transformers")}
                className="hidden"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Transformers</span>
            </label>
          </div>
        </div>

        {/* Security & Sandbox Envelope */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Isolation Profile:
            </span>
            <span className="text-cyan-300 font-bold">gVisor Container Substrate</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Network Egress:</span>
            <span className="text-rose-400 font-bold">100% BLOCKED (Air-Gapped)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Artifact Digest:</span>
            <span className="text-emerald-400">SHA-256 Enclave Verification</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="cyber"
            loading={isCreating}
            icon={<Box className="w-4 h-4" />}
          >
            Spawn Isolated Container
          </Button>
        </div>
      </form>
    </Modal>
  );
}
