import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet } from '@/services/blockchain/wallet';
import { connectStart, connectSuccess } from '@/store/slices/walletSlice';
import useGsap from '@/hooks/useGsap';
import { ArrowRight, Wallet, Terminal, Check, Copy, Sparkles, Database, GitBranch } from 'lucide-react';

export default function HeroSection() {
  const dispatch = useDispatch();
  const { isConnected, address } = useSelector((state) => state.wallet);
  const [copied, setCopied] = useState(false);

  const containerRef = useGsap((gsap) => {
    gsap.from('.hero-anim-item', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
    });
  }, []);

  const handleConnect = async () => {
    if (isConnected) return;
    try {
      dispatch(connectStart());
      const acc = await connectWallet();
      dispatch(connectSuccess({ address: acc, aixBalance: '0' }));
    } catch (err) {
      console.error('Hero connect error:', err);
    }
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx @aixchange/sandbox start');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8"
    >
      {/* Background Radial Glow Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-indigo-600/10 to-purple-600/10 blur-3xl -z-10 rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-48 left-1/4 w-[350px] h-[300px] bg-cyan-500/10 blur-[100px] -z-10 rounded-full"
      />

      {/* Pill Badge */}
      <div className="hero-anim-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner mb-6 text-xs text-slate-300 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Decentralized AI Marketplace & Provenance Substrate</span>
      </div>

      {/* Display Headline */}
      <h1 className="hero-anim-item text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
        Exchange Datasets.{' '}
        <span className="text-cyan-400 bg-clip-text [-webkit-background-clip:text] bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
          Train Models.
        </span>{' '}
        Verify Provenance.
      </h1>

      {/* Lead Paragraph */}
      <p className="hero-anim-item text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed px-2">
        The Web3 infrastructure protocol for AI assets. Monetize datasets with automated smart contract royalties, train in confidential sandboxes, and anchor model lineage to the blockchain.
      </p>

      {/* Call to Actions */}
      <div className="hero-anim-item flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10 w-full max-w-md sm:max-w-none">
        <Link
          to="/datasets"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Database className="w-4 h-4 text-slate-950" />
          <span>Explore Datasets</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </Link>

        {isConnected ? (
          <Link
            to="/wallet-test"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-300 font-semibold text-sm border border-slate-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>
              Connected ({address?.substring(0, 6)}...{address?.substring(address.length - 4)})
            </span>
          </Link>
        ) : (
          <button
            onClick={handleConnect}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Connect Web3 Wallet</span>
          </button>
        )}

        <Link
          to="/provenance"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-800 transition-colors"
        >
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span>Live Lineage DAG</span>
        </Link>
      </div>

      {/* Terminal Command Snippet */}
      <div className="hero-anim-item flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 shadow-sm">
        <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-slate-500 select-none">$</span>
        <span className="text-cyan-300">npx @aixchange/sandbox start</span>
        <button
          onClick={handleCopyCli}
          aria-label="Copy CLI command"
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </section>
  );
}
