import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Box,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Terminal,
} from 'lucide-react';

export default function ProvenanceShowcase() {
  const [activeNode, setActiveNode] = useState(0);

  const lineageNodes = [
    {
      id: 'dataset',
      type: 'SOURCE DATASET',
      label: 'Chest X-Ray CardioVascular Imaging',
      cid: 'QmZtmD2qt8fJpq3CLDHNuHGin69aw1Ywi36Aod6aFC7wE1',
      icon: Database,
      accent: 'text-[#40D9F2]',
      border: 'border-[#40D9F2]/40',
      badge: 'IPFS Content-Addressed',
      meta: '842.1 KB • 4,200 tensors • SHA-256 Verified',
      details: 'Raw training observations registered into DatasetRegistry.sol with cryptographic CID verification. Immutable and tamper-evident.',
    },
    {
      id: 'sandbox',
      type: 'CONTAINER TRAINING',
      label: 'Sandbox Execution #812',
      cid: 'exec-812-pytorch-gpu (Confidential Enclave)',
      icon: Box,
      accent: 'text-amber-400',
      border: 'border-amber-500/40',
      badge: 'Isolated Docker Runtime',
      meta: '4 CPUs • 8GB RAM • UID 1000 Non-Root',
      details: 'Model trained in containerized sandbox with immutable execution environment logs, training loss curves, and hardware resource boundaries.',
    },
    {
      id: 'model',
      type: 'NEURAL WEIGHTS',
      label: 'ResNet-Benchmark-3010 Weights',
      cid: 'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4',
      icon: Cpu,
      accent: 'text-[#818CF8]',
      border: 'border-[#818CF8]/40',
      badge: 'Validated Checksum',
      meta: 'v2 Checkpoint • PyTorch Format',
      details: 'Weights serialized, digested via SHA-256, and validated by the Python AI inference engine before on-chain registration.',
    },
    {
      id: 'ledger',
      type: 'BLOCKCHAIN ANCHOR',
      label: 'ProvenanceRegistry.sol',
      cid: 'Tx: 0x448a6569695dbe5fb51c758a1d520320fa66521f',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/40',
      badge: 'Ethereum Consensus',
      meta: 'Block #21 • Hardhat / Sepolia Confirmed',
      details: 'Final immutable linkage tuple (datasetId, execId, modelId) anchored to Ethereum smart contracts, enabling cryptographic provenance auditing.',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Editorial & Value Proposition */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-[#4F7DFF] uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-[#4F7DFF]" />
            <span>VERIFIABLE MODEL LINEAGE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7FC] tracking-tight leading-[1.15]">
            Know where your AI comes from.
          </h2>

          <p className="text-[#A1ACBF] text-sm sm:text-base leading-relaxed font-sans">
            Explore recorded relationships between datasets, model development, and registered AI assets through a transparent provenance workflow.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FC]">Data Poisoning Protection</h4>
                <p className="text-xs text-[#A1ACBF]">Cryptographic CIDs prevent training datasets from silent tampering post-publication.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#4F7DFF]/10 border border-[#4F7DFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7DFF]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FC]">Audit-Ready Compliance</h4>
                <p className="text-xs text-[#A1ACBF]">Container runtimes log full execution environments and hardware telemetry.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#40D9F2]/10 border border-[#40D9F2]/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#40D9F2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FC]">Upstream Royalty Attribution</h4>
                <p className="text-xs text-[#A1ACBF]">Smart contracts link downstream model revenue directly to source data providers.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/provenance"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F1522] hover:bg-[#0A0E16] text-[#F4F7FC] text-xs font-semibold border border-white/10 hover:border-white/20 transition-all shadow-sm"
            >
              <span>Explore Interactive Lineage DAG</span>
              <ArrowRight className="w-4 h-4 text-[#40D9F2]" />
            </Link>
          </div>
        </div>

        {/* Right Column: Lineage Visualizer Preview Card */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0E16] border border-white/[0.08] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-[#F4F7FC]">
                  Model Lineage Verification Sequence
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#737F93]">
                Click step to inspect
              </span>
            </div>

            {/* Interactive Sequence Steps */}
            <div className="space-y-3">
              {lineageNodes.map((node, idx) => {
                const Icon = node.icon;
                const isSelected = activeNode === idx;
                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNode(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? `bg-[#0F1522] ${node.border} shadow-md`
                        : 'bg-[#05070B]/60 border-white/[0.06] hover:bg-[#0F1522]/50 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-[#0A0E16] border border-white/10 flex items-center justify-center shrink-0 ${node.accent}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#737F93] uppercase">
                              {node.type}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#A1ACBF]">
                              {node.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#F4F7FC] mt-0.5">
                            {node.label}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-mono text-[#737F93] truncate block max-w-[180px]">
                          {node.cid}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#A1ACBF] font-sans leading-relaxed animate-in fade-in duration-200">
                        <p>{node.details}</p>
                        <div className="mt-2 text-[10px] font-mono text-[#40D9F2]">
                          Metadata: {node.meta}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Verification Footer Pill */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#737F93]">
              <span>Cryptographic Proof Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lineage Tuple Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
