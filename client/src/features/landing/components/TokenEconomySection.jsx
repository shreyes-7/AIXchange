import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Coins, ArrowRight, ShieldCheck, Wallet, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function TokenEconomySection() {
  const { isConnected, address, aixBalance } = useSelector((state) => state.wallet);

  const tokenFlow = [
    {
      step: '01',
      title: 'Token Acquisition',
      desc: 'Obtain AIX utility tokens via the platform faucet, wallet testbed, or supported transfers for on-chain gas & payments.',
    },
    {
      step: '02',
      title: 'Asset Licensing',
      desc: 'Purchase datasets, license proprietary model checkpoints, or execute containerized PyTorch training sessions.',
    },
    {
      step: '03',
      title: 'Royalty Splitting',
      desc: 'RoyaltyEngine.sol splits proceeds: 97.5% goes directly to original creators/licensors and 2.5% to the protocol reserve.',
    },
    {
      step: '04',
      title: 'Audit & Telemetry',
      desc: 'Every split transaction emits on-chain events indexed by the platform for real-time reporting and fraud auditing.',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F1522] border border-white/10 text-xs font-mono text-[#40D9F2] uppercase tracking-wider mb-3">
          <Coins className="w-3.5 h-3.5 text-[#40D9F2]" />
          <span>UTILITY VALUE PROTOCOL</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FC] tracking-tight mb-3">
          One ecosystem. Transparent value exchange.
        </h2>
        <p className="text-[#A1ACBF] text-sm sm:text-base font-sans">
          AIX supports eligible marketplace transactions and the platform's configured payment and royalty workflows with zero-leakage settlement.
        </p>
      </div>

      {/* 4-Step Value Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {tokenFlow.map((flow, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#0A0E16] border border-white/[0.08] hover:border-[#4F7DFF]/40 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/40"
          >
            <div>
              <span className="text-xs font-mono font-bold text-[#40D9F2] mb-3 block">
                STEP {flow.step}
              </span>
              <h3 className="text-base font-bold text-[#F4F7FC] mb-2">{flow.title}</h3>
              <p className="text-xs text-[#A1ACBF] leading-relaxed">{flow.desc}</p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#737F93] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Contract Verified</span>
            </div>
          </div>
        ))}
      </div>

      {/* Real Live Wallet Balance & Terminal Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0E16] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F1522] border border-white/10 flex items-center justify-center text-[#40D9F2] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F4F7FC]">
              {isConnected ? 'Connected Web3 AIX Account' : 'Connect Your Web3 Wallet'}
            </h4>
            <p className="text-xs text-[#A1ACBF] font-mono">
              {isConnected
                ? `${address?.slice(0, 8)}...${address?.slice(-6)} • Chain ID 31337 Synced`
                : 'Connect MetaMask or compatible provider to inspect real token allowances and balances.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {isConnected && (
            <div className="px-4 py-2 rounded-xl bg-[#0F1522] border border-white/10 text-right">
              <span className="text-[10px] font-mono text-[#737F93] uppercase block">Current Balance</span>
              <span className="text-sm font-mono font-bold text-[#40D9F2]">{aixBalance || '0.00'} AIX</span>
            </div>
          )}

          <Link
            to="/wallet"
            className="px-5 py-2.5 rounded-xl bg-[#3976F6] hover:bg-[#4F7DFF] text-white text-xs font-semibold shadow-md shadow-[#3976F6]/25 transition-all shrink-0 inline-flex items-center gap-2"
          >
            <span>Open Wallet Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
