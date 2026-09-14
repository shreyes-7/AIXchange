import { Link } from 'react-router-dom';
import { Upload, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export default function CallToActionCard() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center shadow-2xl">
        {/* Glow Highlights */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/15 blur-3xl rounded-full"
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monetize Data. Train Securely. Protect Intellectual Property.</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Ready to Build on Verifiable AI Infrastructure?
          </h2>

          <p className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed max-w-2xl mx-auto">
            Join researchers, data scientists, and Web3 developers monetizing private datasets, tracking cryptographic lineage, and running distributed AI workloads.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/datasets/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-slate-900" />
              <span>Register Your Dataset</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>

            <Link
              to="/models"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Explore Verified Models</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zero-Leakage Royalty Splitting
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              EIP-191 Cryptographic Authentication
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Hardhat & Sepolia Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
