import React from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Play,
  Hash,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

export default function ModelCard({ model }) {
  const getFrameworkBadge = (fw) => {
    switch ((fw || "").toLowerCase()) {
      case "pytorch":
        return <Badge variant="cyan" size="sm">PyTorch 2.4</Badge>;
      case "transformers":
        return <Badge variant="indigo" size="sm">Transformers</Badge>;
      case "onnx":
        return <Badge variant="emerald" size="sm">ONNX Runtime</Badge>;
      case "safetensors":
        return <Badge variant="cyan" size="sm">Safetensors</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{fw || "AI Model"}</Badge>;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-200 group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getFrameworkBadge(model.framework)}
            <Badge variant="success" size="sm" pulse>
              On-Chain Verified
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {model.version || "v1.0.0"}
          </span>
        </div>

        {/* Title */}
        <Link to={`/models/${model.modelId}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
            {model.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 font-sans">
          {model.description}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono mb-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Parameters</span>
            <span className="font-bold text-white">{model.parameters || "10M"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
            <span className="font-bold text-emerald-400">{model.accuracy || "98.0%"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
            <span className="font-bold text-cyan-300">{model.latency || "12ms"}</span>
          </div>
        </div>

        {/* Bound Dataset & Format */}
        <div className="space-y-1.5 text-[11px] font-mono text-slate-400 mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Trained on:
            </span>
            <Link
              to={`/datasets/${model.datasetId || 1}`}
              className="text-indigo-300 hover:underline truncate max-w-[180px]"
            >
              {model.datasetTitle || `Dataset #${model.datasetId || 1}`}
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              Weight Digest:
            </span>
            <span className="text-slate-300 truncate max-w-[160px] font-bold">
              {model.modelHash ? `${model.modelHash.slice(0, 10)}...` : "SHA-256"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
        <Link to={`/models/${model.modelId}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Inspect Specs &amp; Hash
          </Button>
        </Link>
        <Link to={`/inference?modelId=${model.modelId}`}>
          <Button
            variant="cyber"
            size="sm"
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            title="Test in Interactive Inference Studio"
          >
            Infer
          </Button>
        </Link>
      </div>
    </div>
  );
}
