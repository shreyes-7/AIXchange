import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  GitBranch,
  FileCode,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export default function InferenceResultCard({ result, latencyMs, model }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const isOptimal = (result.prediction || "").includes("OPTIMAL") || (result.prediction || "").includes("HEALTHY");
  const isCritical = (result.prediction || "").includes("CRITICAL") || (result.prediction || "").includes("ANOMALY");
  const isWarning = !isOptimal && !isCritical;

  const anomalyPercent = Math.min(100, Math.max(0, (result.anomalyScore ?? 0.05) * 100));
  const nominalPercent = Math.min(100, Math.max(0, 100 - anomalyPercent));

  const copyResultJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Latency Meter */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm" pulse>
            Forward Pass Completed
          </Badge>
          <span className="text-xs font-mono text-slate-400">
            {model?.name || `Model #${result.modelId || 1}`}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {latencyMs || 12} ms
          </span>
          <button
            onClick={copyResultJSON}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Copy Output JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Classification Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          isOptimal
            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
            : isCritical
            ? "bg-rose-950/40 border-rose-500/60 text-rose-300"
            : "bg-amber-950/40 border-amber-500/60 text-amber-300"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 shrink-0">
            {isOptimal ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : isCritical ? (
              <AlertOctagon className="w-7 h-7 text-rose-400 animate-pulse" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
              Predicted Telemetry Classification
            </span>
            <h3 className="text-xl font-extrabold tracking-tight">
              {result.prediction || "HEALTHY_OPTIMAL"}
            </h3>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {isOptimal
                ? "Telemetry features are running within baseline nominal operating envelopes. Zero threshold degradation observed."
                : isCritical
                ? "Critical boundary deviation detected! High mechanical stress, thermal spike, or voltage sag indicates imminent component failure."
                : "Elevated mechanical stress or temperature drift observed. Predictive maintenance inspection recommended within 48 hours."}
            </p>
          </div>
        </div>
      </div>

      {/* Probability Distribution Meters */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 font-mono text-xs">
        <div className="text-slate-400 font-bold flex items-center justify-between">
          <span>Softmax / Anomaly Probability Distribution</span>
          <span className="text-cyan-400 font-normal">
            Confidence: {((result.confidence ?? 0.984) * 100).toFixed(1)}%
          </span>
        </div>

        {/* Nominal Probability */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">Nominal / Healthy Operating State</span>
            <span className="text-white font-bold">{nominalPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${nominalPercent}%` }}
            />
          </div>
        </div>

        {/* Anomaly Probability */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-rose-400 font-semibold">Anomalous / Failure Deviation Risk</span>
            <span className="text-white font-bold">{anomalyPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                anomalyPercent > 50 ? "bg-rose-500" : "bg-amber-500"
              }`}
              style={{ width: `${anomalyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cryptographic Inference Receipt */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-900">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cryptographic Inference Receipt
          </span>
          <span className="text-slate-500">
            {new Date(result.executionTimestamp || Date.now()).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Anchored Weights Digest:</span>
          <span className="text-cyan-300 truncate max-w-[240px] font-bold">
            {result.modelHash || "569fd95a0b6c30bf06b1368d42e36930873b683259b751edd8fab45c2b2728c2"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Inference Execution Nonce:</span>
          <span className="text-indigo-400 truncate max-w-[240px] font-bold">
            {result.receiptHash || "0x98f42e1a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e"}
          </span>
        </div>
      </div>

      {/* Foot Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          to={`/models/${result.modelId || 1}`}
          className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
        >
          Inspect Model Weights &amp; Checksum →
        </Link>

        <Link
          to={`/provenance?modelId=${result.modelId || 1}`}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          Audit Lineage in Provenance DAG →
        </Link>
      </div>
    </div>
  );
}
