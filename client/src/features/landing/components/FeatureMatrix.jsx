import { Link } from 'react-router-dom';
import { GitBranch, Box, ArrowRight, Lock } from 'lucide-react';

export default function FeatureMatrix() {
  const features = [
    {
      title: 'Decentralized Data Licensing',
      category: 'Smart Contract Rights',
      description:
        'Sell and purchase AI training datasets with programmable legal terms. Enforce Academic, Commercial, or Exclusive rights with zero-leakage token payments via PurchaseEngine.sol.',
      icon: Lock,
      accent: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
      tag: 'ERC-20 Atomic Settlement',
      link: '/datasets',
      linkText: 'Browse Licensed Datasets',
      details: [
        'Deterministic bitmask access rights',
        '2.50% platform fee / 97.50% creator payout',
        'Instant IPFS encrypted CID delivery',
      ],
    },
    {
      title: 'Cryptographic AI Provenance',
      category: 'Verifiable Lineage',
      description:
        'Track every model back to its exact training dataset and execution run. Immutable SHA-256 weight digests are recorded on-chain, eliminating AI dataset poisoning and fraud.',
      icon: GitBranch,
      accent: 'text-indigo-400',
      border: 'hover:border-indigo-500/40',
      tag: 'DAG Lineage Verification',
      link: '/provenance',
      linkText: 'Explore Provenance DAG',
      details: [
        'Immutable (datasetId, execId, modelId) tuple',
        'Interactive Directed Acyclic Graph (DAG)',
        'One-click on-chain audit certificate',
      ],
    },
    {
      title: 'Confidential Docker Sandboxes',
      category: 'AI Training Substrate',
      description:
        'Execute PyTorch models within isolated, unprivileged container sandboxes. Stream real-time training telemetry, loss metrics, and GPU utilization directly to your browser.',
      icon: Box,
      accent: 'text-purple-400',
      border: 'hover:border-purple-500/40',
      tag: 'Containerized PyTorch & Jupyter',
      link: '/sandboxes',
      linkText: 'Launch Training Sandbox',
      details: [
        'Hardware capped (4 CPUs, 8GB RAM, UID 1000)',
        'Live WebSocket telemetry & loss curves',
        'Embedded interactive JupyterLab IDE',
      ],
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
          Decentralized Protocol Architecture
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Engineered for Trustworthy Artificial Intelligence
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          AIXchange bridges decentralized Web3 infrastructure with high-performance machine learning, providing end-to-end auditability from raw data to deployed model weights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${f.border} shadow-lg shadow-slate-950/40 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/60 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${f.accent}`} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/40">
                    {f.tag}
                  </span>
                </div>

                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  {f.category}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{f.description}</p>

                <ul className="space-y-2 mb-6 border-t border-slate-800/60 pt-4">
                  {f.details.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${f.accent.replace('text-', 'bg-')}`} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={f.link}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 group-hover:translate-x-0.5 duration-200"
              >
                <span>{f.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
