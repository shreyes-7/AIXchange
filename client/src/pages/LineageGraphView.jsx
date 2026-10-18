import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { LineageDAGGraph, VerifyProvenanceModal } from "../components/provenance";
import { getModelMetadata, getAllStoredModelMetadata } from "../services/modelMetadata";
import { getDatasetMetadata } from "../services/datasetMetadata";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  GitBranch,
  Layers,
  Database,
  Box,
  ExternalLink,
} from "lucide-react";

export default function LineageGraphView() {
  const { modelId } = useParams();
  const activeModelId = modelId || "1";

  const [selectedNodeId, setSelectedNodeId] = useState("model");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const model = useMemo(() => {
    return getModelMetadata(activeModelId);
  }, [activeModelId]);

  const dataset = useMemo(() => {
    return getDatasetMetadata(model.datasetId || 1);
  }, [model]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <Link
              to={`/provenance?modelId=${activeModelId}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Provenance Explorer</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Lineage DAG Graph: {model.name}
              </h1>
              <Badge variant="cyan">Model #{activeModelId}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Cryptographic lifecycle graph connecting dataset provenance, Docker sandbox training, and neural weights.
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
            <Link to={`/inference?modelId=${activeModelId}`}>
              <Button variant="secondary" icon={<Zap className="w-4 h-4" />}>
                Test in Inference Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Full Interactive DAG Canvas */}
        <LineageDAGGraph
          model={model}
          dataset={dataset}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
        />
      </main>

      <Footer />

      {/* Verification Modal */}
      <VerifyProvenanceModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        model={model}
        dataset={dataset}
      />
    </div>
  );
}
