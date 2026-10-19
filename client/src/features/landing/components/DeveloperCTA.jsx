import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Copy, Check, Database, Sparkles, BookOpen } from 'lucide-react';

export default function DeveloperCTA() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx @aixchange/sandbox start');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0A0E16] via-[#0F1522] to-[#0A0E16] border border-white/[0.08] p-8 sm:p-14 lg:p-16 text-center shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#3976F6]/15 blur-3xl rounded-full"
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05070B] border border-white/10 text-xs font-mono text-[#40D9F2] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#40D9F2]" />
            <span>OPEN AI SUBSTRATE PROTOCOL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7FC] tracking-tight mb-5 leading-tight">
            Build with data you can trust.
          </h2>

          <p className="text-[#A1ACBF] text-sm sm:text-base mb-10 leading-relaxed max-w-2xl mx-auto font-sans">
            Discover datasets, register AI models, and participate in a more transparent ecosystem for AI assets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link
              to="/datasets"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3976F6] hover:bg-[#4F7DFF] text-white font-semibold text-sm shadow-lg shadow-[#3976F6]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Database className="w-4 h-4 text-white" />
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              to="/datasets/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F1522] hover:bg-[#05070B] text-[#F4F7FC] font-semibold text-sm border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-[#40D9F2]" />
              <span>Register New Asset</span>
            </Link>
          </div>

          {/* CLI Snippet */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#05070B] border border-white/10 text-xs font-mono text-[#A1ACBF] shadow-inner">
            <Terminal className="w-4 h-4 text-[#40D9F2]" />
            <span className="text-[#737F93] select-none">$</span>
            <span className="text-[#F4F7FC]">npx @aixchange/sandbox start</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-[#0F1522] text-[#737F93] hover:text-[#F4F7FC] transition-colors ml-1"
              title="Copy sandbox CLI command"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
