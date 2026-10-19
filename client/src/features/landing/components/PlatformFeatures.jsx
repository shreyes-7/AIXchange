import {
  Database,
  Layers,
  GitBranch,
  ShieldCheck,
  Coins,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlatformFeatures() {
  const features = [
    {
      title: 'AI Dataset Marketplace',
      tag: 'Decentralized Data',
      description: 'Discover and exchange vetted datasets with programmable legal terms, deterministic bitmasks, and encrypted IPFS storage.',
      icon: Database,
      accent: 'text-[#40D9F2]',
      link: '/datasets',
    },
    {
      title: 'AI Model Marketplace',
      tag: 'Neural Weights',
      description: 'Publish and discover production-ready model weights with cryptographic SHA-256 digests and version histories.',
      icon: Layers,
      accent: 'text-[#4F7DFF]',
      link: '/models',
    },
    {
      title: 'Verifiable AI Provenance',
      tag: 'Cryptographic Lineage',
      description: 'Trace immutable relationships between input datasets, training parameters, and final weights through an interactive DAG.',
      icon: GitBranch,
      accent: 'text-indigo-400',
      link: '/provenance',
    },
    {
      title: 'Blockchain-Backed Ownership',
      tag: 'EIP-191 Smart Contracts',
      description: 'Enforce creator copyright and license terms with Ethereum smart contracts that anchor state on Sepolia and Hardhat.',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
      link: '/wallet',
    },
    {
      title: 'Transparent Royalty Engine',
      tag: 'Multi-Party Splits',
      description: 'Automated basis-point splits guarantee that dataset contributors receive automated royalties whenever derivative models monetize.',
      icon: Coins,
      accent: 'text-[#818CF8]',
      link: '/royalties',
    },
    {
      title: 'AIX Utility Token Economy',
      tag: 'ERC-20 Settlement',
      description: 'Seamless value exchange powering dataset licensing, compute fees, and inference API micro-transactions across the platform.',
      icon: Cpu,
      accent: 'text-cyan-400',
      link: '/analytics',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-[#40D9F2] uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#40D9F2]" />
          <span>CORE DIFFERENTIATORS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FC] tracking-tight mb-3">
          Engineered for Trustworthy Artificial Intelligence
        </h2>
        <p className="text-[#A1ACBF] text-sm sm:text-base font-sans">
          AIXchange bridges decentralized Web3 infrastructure with modern machine learning, delivering end-to-end auditability and transparent incentives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <Link
              key={idx}
              to={feat.link}
              className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/40 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F1522] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${feat.accent}`} />
                  </div>
                  <span className="text-[10px] font-mono text-[#737F93] px-2 py-0.5 rounded-full bg-[#0F1522] border border-white/10">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F4F7FC] mb-2 group-hover:text-[#40D9F2] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#A1ACBF] leading-relaxed mb-4">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#737F93] group-hover:text-[#F4F7FC] transition-colors">
                <span>Explore feature</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4F7DFF] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
