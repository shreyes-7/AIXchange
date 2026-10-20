import { Link } from 'react-router-dom';
import { ShieldCheck, Terminal, Cpu, Database, GitBranch, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#05070B] border-t border-white/[0.08] text-[#A1ACBF] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-8 h-8 rounded-xl bg-[#080E1A] border border-cyan-500/30 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20 overflow-hidden">
                <img src="/favicon.svg" alt="AIXchange Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#F4F7FC]">
                AIX<span className="text-[#40D9F2]">change</span>
              </span>
            </Link>
            <p className="text-xs text-[#A1ACBF] leading-relaxed">
              Decentralized AI asset marketplace, verifiable model lineage, and confidential containerized execution substrate powered by Ethereum smart contracts and IPFS.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographically Anchored SHA-256</span>
            </div>
          </div>

          {/* Column 2: Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F7FC] mb-4 flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-[#40D9F2]" />
              Asset Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/datasets" className="hover:text-[#40D9F2] transition-colors">
                  Dataset Discovery Catalog
                </Link>
              </li>
              <li>
                <Link to="/datasets/register" className="hover:text-[#40D9F2] transition-colors">
                  Register New Dataset (10-Stage)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-[#40D9F2] transition-colors">
                  Verified Model Weights
                </Link>
              </li>
              <li>
                <Link to="/models/register" className="hover:text-[#40D9F2] transition-colors">
                  Register Model Weights
                </Link>
              </li>
              <li>
                <Link to="/my-assets" className="hover:text-[#40D9F2] transition-colors">
                  My Purchased Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AI Studio & Lineage */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F7FC] mb-4 flex items-center gap-1.5 font-mono">
              <GitBranch className="w-3.5 h-3.5 text-[#4F7DFF]" />
              AI Studio &amp; Provenance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/inference" className="hover:text-[#40D9F2] transition-colors">
                  Inference Playground
                </Link>
              </li>
              <li>
                <Link to="/sandboxes" className="hover:text-[#40D9F2] transition-colors">
                  Docker Training Sandboxes
                </Link>
              </li>
              <li>
                <Link to="/provenance" className="hover:text-[#40D9F2] transition-colors">
                  Lineage DAG Visualizer
                </Link>
              </li>
              <li>
                <Link to="/royalties" className="hover:text-[#40D9F2] transition-colors">
                  Automated Royalty Splits
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-[#40D9F2] transition-colors">
                  Platform Telemetry &amp; Gas
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Substrate Quickstart */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F7FC] mb-4 flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#818CF8]" />
              Developer Terminal
            </h4>
            <p className="text-xs text-[#A1ACBF] mb-2.5">
              Launch local unprivileged training container:
            </p>
            <div className="bg-[#0A0E16] border border-white/10 rounded-xl p-3 font-mono text-[11px] text-[#40D9F2] select-all overflow-x-auto shadow-inner">
              <code>npx @aixchange/sandbox start</code>
            </div>
            <div className="mt-3.5 flex items-center gap-2 text-[11px] font-mono text-[#737F93]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hardhat Chain 31337 Synced</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737F93]">
          <p>© 2026 AIXchange Protocol. Built for decentralized AI research &amp; commercial monetization.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>EIP-191 Auth</span>
            <span className="text-slate-700">•</span>
            <span>Solidity ^0.8.28</span>
            <span className="text-slate-700">•</span>
            <span>IPFS Content Addressed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
