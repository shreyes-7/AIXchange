import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Box, Cpu, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProvenanceTeaser() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'dataset',
      title: '1. Dataset Anchor',
      subtitle: 'IPFS Storage CID',
      hash: 'QmZ4tDuGbek1K...7F2b8e',
      icon: Database,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      description: 'Raw training data uploaded to IPFS and registered into DatasetRegistry.sol with cryptographic CID verification.',
    },
    {
      id: 'sandbox',
      title: '2. Sandbox Training',
      subtitle: 'Execution ID #812',
      hash: 'exec-812-pytorch-gpu',
      icon: Box,
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      description: 'Model trained in containerized sandbox with immutable environment logs, loss curves, and hardware limits.',
    },
    {
      id: 'model',
      title: '3. Model Weights',
      subtitle: 'SHA-256 Checksum',
      hash: 'e3b0c44298fc1c...b855',
      icon: Cpu,
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      description: 'Weights serialized, digested via SHA-256, and validated by Python AI substrate before on-chain registration.',
    },
    {
      id: 'provenance',
      title: '4. On-Chain Lineage',
      subtitle: 'ProvenanceRegistry.sol',
      hash: 'Tx: 0x8f2a...91ce',
      icon: ShieldCheck,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      description: 'Final linkage immutable tuple (datasetId, execId, modelId) written to Ethereum Sepolia ledger.',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifiable Cryptographic Trail</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Interactive Model Lineage Visualizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-2 leading-relaxed">
              Every trained model can be traced step-by-step to its input datasets and compute runtime. Click any step to inspect verification parameters.
            </p>
          </div>

          <Link
            to="/provenance"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm shrink-0"
          >
            <span>Open Full DAG Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>

        {/* Step Flow Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? `${step.border} bg-slate-850 shadow-md shadow-slate-950`
                    : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center ${step.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Inspecting</span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white">{step.title}</div>
                <div className="text-[11px] text-slate-400 mb-2">{step.subtitle}</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-850 font-mono text-[10px] text-slate-400 truncate">
                  {step.hash}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Node Detail Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white mr-1.5">{steps[activeStep].title}:</strong>
              {steps[activeStep].description}
            </p>
          </div>
          <div className="font-mono text-[11px] text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-md border border-cyan-800/40 shrink-0">
            Audit Status: VERIFIED
          </div>
        </div>
      </div>
    </section>
  );
}
