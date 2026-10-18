import React, { useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Check,
  Folder,
  FileText,
  Terminal,
  Shield,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export default function JupyterEmbed({
  jupyterStatus = {
    status: "RUNNING",
    port: "8888",
    token: "aixchange_sandbox_token",
    url: "http://127.0.0.1:8888/lab?token=aixchange_sandbox_token",
  },
  onRefresh,
}) {
  const [embedFrame, setEmbedFrame] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  const copyToken = () => {
    navigator.clipboard.writeText(jupyterStatus.token || "");
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleReloadFrame = () => {
    setFrameKey((prev) => prev + 1);
    if (onRefresh) onRefresh();
  };

  const preloadedNotebooks = [
    {
      title: "01_telemetry_model_training.ipynb",
      desc: "End-to-end PyTorch regression loop. Ingests encrypted CSV telemetry, trains MLP, and exports model.safetensors with SHA-256 verification.",
      tag: "PyTorch 2.4",
      tagColor: "cyan",
    },
    {
      title: "02_dataset_exploratory_analysis.ipynb",
      desc: "Exploratory data analysis with Pandas, Matplotlib, and vibration anomaly distribution plots for Dataset #1.",
      tag: "Analytics",
      tagColor: "purple",
    },
    {
      title: "03_safetensors_export_and_attestation.ipynb",
      desc: "Cryptographic packaging script that hashes model weights into SHA-256 digest for anchoring to Model Registry.",
      tag: "Safetensors",
      tagColor: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                JupyterLab Server {jupyterStatus.status || "RUNNING"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Port {jupyterStatus.port || "8888"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Air-Gapped Isolation
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Air-Gapped JupyterLab Training Environment
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              A fully isolated interactive Python notebook environment anchored to the sandbox workspace.
              Train deep learning models, analyze dataset telemetry, inspect PyTorch tensors, and export verifiable Safetensors model weights.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={jupyterStatus.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in New Window
            </a>
            <button
              onClick={() => setEmbedFrame(!embedFrame)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              {embedFrame ? "Hide Frame" : "Show Frame"}
            </button>
            <button
              onClick={handleReloadFrame}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Reload Frame"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Substrate Connection Parameters */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block mb-1">Jupyter Host & Port</span>
            <span className="text-cyan-300 font-semibold">http://127.0.0.1:{jupyterStatus.port || "8888"}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-slate-500 text-[10px] uppercase block mb-1">Auth Token</span>
              <span className="text-slate-200 truncate block">{jupyterStatus.token || "aixchange_sandbox_token"}</span>
            </div>
            <button
              onClick={copyToken}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-semibold shrink-0 transition-colors flex items-center gap-1"
              title="Copy token to clipboard"
            >
              {tokenCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block mb-1">Workspace Isolation Root</span>
            <span className="text-purple-300 font-semibold truncate block">/python-services/workspace</span>
          </div>
        </div>
      </div>

      {/* Embedded JupyterLab Frame */}
      {embedFrame && (
        <div
          className={`rounded-3xl border border-cyan-500/40 bg-slate-950 overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? "fixed inset-4 z-50 flex flex-col" : "relative"
          }`}
        >
          {/* Frame Titlebar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-white font-semibold">
                JupyterLab 4.2 IDE — Air-Gapped Container ({jupyterStatus.port || "8888"})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReloadFrame}
                className="hover:text-white flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Reload Frame
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:text-white flex items-center gap-1 text-[11px]"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3 h-3" /> Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" /> Fullscreen
                  </>
                )}
              </button>
              <a
                href={jupyterStatus.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Direct Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="relative flex-1 bg-slate-950 min-h-[640px]">
            <iframe
              key={frameKey}
              src={jupyterStatus.url}
              title="JupyterLab Substrate IDE"
              className={`w-full border-0 ${isFullscreen ? "h-[calc(100vh-100px)]" : "h-[680px]"}`}
            />
          </div>
        </div>
      )}

      {/* Preloaded Notebooks & Mounted Filesystem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preloaded Notebooks Card */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Preloaded Training Notebooks</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pre-configured notebooks in your air-gapped workspace ready for one-click exploration:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {preloadedNotebooks.map((nb, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold flex-wrap">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{nb.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                        {nb.tag}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1.5 font-sans leading-relaxed">
                      {nb.desc}
                    </p>
                  </div>
                  <a
                    href={jupyterStatus.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    Launch
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Directory Structure */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Mounted Workspace Filesystem</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Strict container directory tree preventing root traversal escapes:
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2.5">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>/workspace</span>
              </div>
              <div className="pl-5 text-slate-400 space-y-2">
                <div>
                  ├── 📁 <span className="text-emerald-300 font-semibold">input/</span>{" "}
                  <span className="text-slate-500 text-[11px]">(Decrypted dataset slices &amp; configs)</span>
                </div>
                <div>
                  ├── 📁 <span className="text-purple-300 font-semibold">notebooks/</span>{" "}
                  <span className="text-slate-500 text-[11px]">(Interactive JupyterLab .ipynb files)</span>
                </div>
                <div>
                  ├── 📁 <span className="text-amber-300 font-semibold">code/</span>{" "}
                  <span className="text-slate-500 text-[11px]">(PyTorch training loops &amp; models)</span>
                </div>
                <div>
                  └── 📁 <span className="text-cyan-300 font-semibold">output/</span>{" "}
                  <span className="text-slate-500 text-[11px]">(Exported weights &amp; training_summary.json)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Files written to <code>/workspace/output</code> are hashed into verified Safetensors digests.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
