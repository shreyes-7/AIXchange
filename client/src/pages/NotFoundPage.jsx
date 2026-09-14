import { Link } from 'react-router-dom';
import PublicShell from '@/layouts/PublicShell';
import { AlertOctagon, Home, Database } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <PublicShell>
      <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-xl shadow-rose-950/20">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 mb-4">
          <span>HTTP 404 — UNANCHORED ROUTE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Route Does Not Exist
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          The requested page, contract endpoint, or cryptographic asset hash could not be located in the AIXchange decentralized routing tree.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/datasets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-semibold text-xs border border-slate-800 transition-colors"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Explore Marketplace</span>
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
