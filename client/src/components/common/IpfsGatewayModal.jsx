import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  HardDrive,
  Globe,
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  Database,
} from "lucide-react";
import { IPFS_GATEWAYS } from "../../services/datasetMetadata";

export default function IpfsGatewayModal({ dataset, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("gateways"); // "gateways" | "preview"

  if (!isOpen || !dataset) return null;

  const cid = dataset.cid || "QmUnknown";

  const handleCopy = () => {
    navigator.clipboard.writeText(cid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Title Bar */}
        <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Decentralized IPFS Storage & Gateway Inspector
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Dataset ID #{dataset.datasetId} · {dataset.title || "AI Training Dataset"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* CID Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500">
                IPFS Content Identifier (CIDv0 Multihash)
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy CID
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-cyan-300 break-all select-all">
              {cid}
            </p>
          </div>

          {/* Encryption Notice Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Encrypted IPFS Payload: </span>
              Datasets on AIXchange are encrypted with <span className="text-cyan-300 font-mono font-bold">AES-256-GCM</span> prior to IPFS distribution.
              Public mirrors like <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">ipfs.io</code> can throttle or time out (504) searching unpinned DHTs.
              Use our fast <span className="text-emerald-400 font-semibold">Substrate Node Gateway</span> below to inspect immediately.
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("gateways")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "gateways"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white bg-slate-800/40"
              }`}
            >
              IPFS Gateway Mirrors ({IPFS_GATEWAYS.length})
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white bg-slate-800/40"
              }`}
            >
              Data Schema & Details
            </button>
          </div>

          {/* Tab 1: Gateways List */}
          {activeTab === "gateways" && (
            <div className="space-y-3">
              {IPFS_GATEWAYS.map((gw, idx) => {
                const targetUrl = gw.url(cid);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      gw.recommended
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-xs text-white truncate">
                          {gw.name}
                        </span>
                        {gw.recommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                        {gw.status}
                      </div>
                    </div>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 ${
                        gw.recommended
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      Open Gateway
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Data Schema & Specs */}
          {activeTab === "preview" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">File Name</span>
                  <span className="text-white font-semibold">{dataset.fileName || "dataset.csv"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">File Size</span>
                  <span className="text-cyan-300 font-semibold">{dataset.fileSize || "351 KB"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Dataset Category</span>
                  <span className="text-indigo-300 font-semibold">{dataset.category || "IoT / Sensor Telemetry"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Encryption Algorithm</span>
                  <span className="text-emerald-400 font-semibold">AES-256-GCM Envelope</span>
                </div>
              </div>

              {/* Sample Telemetry Schema Table */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-2 font-sans font-semibold">
                  Sample Data Schema (Sanitized Sensor Telemetry):
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                        <th className="pb-1.5">timestamp</th>
                        <th className="pb-1.5">device_id</th>
                        <th className="pb-1.5">temperature</th>
                        <th className="pb-1.5">vibration</th>
                        <th className="pb-1.5">voltage</th>
                        <th className="pb-1.5">rpm</th>
                        <th className="pb-1.5">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      <tr>
                        <td className="py-1">08:00:00Z</td>
                        <td>SNSR-001</td>
                        <td className="text-cyan-400">24.2 °C</td>
                        <td>0.081</td>
                        <td>380.1 V</td>
                        <td>1850</td>
                        <td className="text-emerald-400">NORMAL</td>
                      </tr>
                      <tr>
                        <td className="py-1">08:15:00Z</td>
                        <td>SNSR-001</td>
                        <td className="text-amber-400">68.9 °C</td>
                        <td>0.284</td>
                        <td>351.2 V</td>
                        <td>2240</td>
                        <td className="text-amber-400">WARNING</td>
                      </tr>
                      <tr>
                        <td className="py-1">08:18:00Z</td>
                        <td>SNSR-001</td>
                        <td className="text-rose-400">92.5 °C</td>
                        <td>0.389</td>
                        <td>332.1 V</td>
                        <td>2480</td>
                        <td className="text-rose-400">CRITICAL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Decentralized Substrate Node · Port 5000 Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
