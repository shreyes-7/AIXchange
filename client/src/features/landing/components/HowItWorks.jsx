import { Search, Terminal, ShieldCheck, Coins } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Discover',
      action: 'Find Assets',
      description: 'Search vetted datasets, pre-trained neural weights, and domain-specific benchmarks in the open decentralized catalog.',
      icon: Search,
      tag: 'Catalog & Search',
    },
    {
      number: '02',
      title: 'Build',
      action: 'Train in Sandboxes',
      description: 'Utilize eligible datasets to train and fine-tune models in isolated, unprivileged Docker GPU sandboxes with live telemetry.',
      icon: Terminal,
      tag: 'Docker Enclaves',
    },
    {
      number: '03',
      title: 'Verify',
      action: 'Audit Lineage',
      description: 'Inspect cryptographically anchored relationships between datasets, runtime logs, and SHA-256 weight checksums on Ethereum.',
      icon: ShieldCheck,
      tag: 'Immutable DAG',
    },
    {
      number: '04',
      title: 'Exchange',
      action: 'Settle Royalties',
      description: 'Monetize assets with AIX utility tokens. RoyaltyEngine.sol automatically distributes revenue to upstream data licensors.',
      icon: Coins,
      tag: 'Smart Royalties',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-[#4F7DFF] uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7DFF]" />
          <span>WORKFLOW ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FC] tracking-tight mb-3">
          From data to intelligence. With trust built in.
        </h2>
        <p className="text-[#A1ACBF] text-sm sm:text-base font-sans">
          A connected ecosystem for discovering, building, and exchanging AI assets with transparent provenance and verifiable execution.
        </p>
      </div>

      {/* 4-Step Connected Sequence */}
      <div className="relative">
        {/* Subtle Horizontal Connecting Line on Desktop */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-1/2 left-12 right-12 h-px -translate-y-6 border-t border-dashed border-white/10 -z-10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/40 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-extrabold font-mono text-[#4F7DFF] group-hover:text-[#40D9F2] transition-colors">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#0F1522] border border-white/10 flex items-center justify-center text-[#40D9F2] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-[#737F93] uppercase tracking-wider mb-1">
                    {step.tag}
                  </div>
                  <h3 className="text-lg font-bold text-[#F4F7FC] mb-2">{step.title}</h3>
                  <p className="text-xs text-[#A1ACBF] leading-relaxed">{step.description}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-[#40D9F2]">
                  <span className="w-1 h-1 rounded-full bg-[#40D9F2]" />
                  <span>{step.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
