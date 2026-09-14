import { Link } from 'react-router-dom';
import { ShieldCheck, Terminal, Cpu, Database, GitBranch, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
                <Cpu className="w-4 h-4 text-cyan-200" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                AIX<span className="text-cyan-400">change</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decentralized AI asset marketplace, verifiable model lineage, and confidential containerized execution substrate powered by Ethereum smart contracts and IPFS.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographically Anchored SHA-256</span>
            </div>
          </div>

          {/* Column 2: Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Asset Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/datasets" className="hover:text-cyan-400 transition-colors">
                  Dataset Discovery Catalog
                </Link>
              </li>
              <li>
                <Link to="/datasets/register" className="hover:text-cyan-400 transition-colors">
                  Register New Dataset (10-Stage)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-cyan-400 transition-colors">
                  Verified Model Weights
                </Link>
              </li>
              <li>
                <Link to="/sandboxes" className="hover:text-cyan-400 transition-colors">
                  Docker Training Sandboxes
                </Link>
              </li>
              <li>
                <Link to="/wallet-test" className="hover:text-cyan-400 transition-colors">
                  Web3 Developer Testbed
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Lineage */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              Provenance & Royalties
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/provenance" className="hover:text-indigo-400 transition-colors">
                  Lineage DAG Visualizer
                </Link>
              </li>
              <li>
                <Link to="/royalties" className="hover:text-indigo-400 transition-colors">
                  Automated Royalty Splits
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-indigo-400 transition-colors">
                  Platform Telemetry & Gas
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/shreyes-7/AIXchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                >
                  Contract Source Code <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Substrate Quickstart */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              AI Substrate SDK
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              Execute sandboxed model training via client CLI:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-cyan-300 select-all overflow-x-auto">
              <code>npx @aixchange/sandbox start</code>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sepolia / Hardhat Substrate Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AIXchange Protocol. Built for decentralized AI research & commercial monetization.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-600">•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span className="text-slate-600">•</span>
            <span>Solidity ^0.8.28</span>
            <span className="text-slate-600">•</span>
            <span>React 19 + Vite 8</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
