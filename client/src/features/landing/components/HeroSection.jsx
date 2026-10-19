import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet } from '@/services/blockchain/wallet';
import { connectStart, connectSuccess } from '@/store/slices/walletSlice';
import useGsap from '@/hooks/useGsap';
import {
  ArrowRight,
  Wallet,
  Terminal,
  Check,
  Copy,
  Sparkles,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export default function HeroSection() {
  const dispatch = useDispatch();
  const { isConnected, address } = useSelector((state) => state.wallet);
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

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
      className="relative w-full overflow-hidden min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-24 border-b border-white/[0.06]"
    >
      {/* 
        ====================================================================
        HERO VIDEO BACKGROUND
        Uses client/public/hp_video.mp4 via public URL '/hp_video.mp4'
        Configured as an ambient, muted, loopable, pointer-events-none layer
        ====================================================================
      */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-20 opacity-40 mix-blend-screen scale-[1.02]"
        >
          <source src="/hp_video.mp4" type="video/mp4" />
        </video>
      )}

      {/* 
        Critical Readability Treatment:
        Dual-direction dark gradients to ensure the headline & copy remain
        deeply legible while letting the ambient video movement show through.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#05070B] via-[#05070B]/85 to-[#05070B]/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#05070B]/30 via-transparent to-[#05070B]"
      />

      {/* Subtle Electric Blue Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[460px] bg-gradient-to-tr from-[#3976F6]/15 via-[#4F7DFF]/10 to-[#40D9F2]/10 blur-[140px] -z-10 rounded-full"
      />

      {/* Eyebrow Pill */}
      <div className="hero-anim-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F1522]/90 border border-white/10 shadow-inner mb-6 text-xs text-[#A1ACBF] font-mono tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#40D9F2] animate-pulse" />
        <span className="font-semibold text-[#F4F7FC]">THE DECENTRALIZED AI ECONOMY</span>
      </div>

      {/* Display Headline */}
      <h1 className="hero-anim-item text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F7FC] max-w-4xl leading-[1.1] mb-6">
        Where AI Assets Meet{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#40D9F2] via-[#4F7DFF] to-[#818CF8]">
          Trust &amp; Ownership.
        </span>
      </h1>

      {/* Explanatory Paragraph */}
      <p className="hero-anim-item text-[#A1ACBF] text-sm sm:text-base md:text-lg max-w-2xl mb-10 leading-relaxed px-2 font-sans">
        A unified marketplace for AI datasets and models, powered by verifiable ownership, transparent provenance, and blockchain-enabled transactions.
      </p>

      {/* Call to Actions */}
      <div className="hero-anim-item flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 mb-10 w-full max-w-md sm:max-w-none">
        <Link
          to="/datasets"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3976F6] hover:bg-[#4F7DFF] text-white font-semibold text-sm shadow-lg shadow-[#3976F6]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Database className="w-4 h-4 text-white" />
          <span>Explore Marketplace</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>

        <Link
          to="/inference"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F1522]/90 hover:bg-[#0F1522] text-[#F4F7FC] font-semibold text-sm border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-[#40D9F2]" />
          <span>Launch AI Studio</span>
        </Link>

        {isConnected ? (
          <Link
            to="/wallet"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0A0E16] hover:bg-[#0F1522] text-[#40D9F2] font-mono text-xs font-semibold border border-white/10 shadow-sm transition-all"
          >
            <Wallet className="w-4 h-4 text-[#40D9F2]" />
            <span>
              {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </span>
          </Link>
        ) : (
          <button
            onClick={handleConnect}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0A0E16] hover:bg-[#0F1522] text-[#A1ACBF] hover:text-[#F4F7FC] font-semibold text-xs border border-white/10 shadow-sm transition-all"
          >
            <Wallet className="w-4 h-4 text-[#40D9F2]" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {/* Terminal Command Snippet */}
      <div className="hero-anim-item flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0A0E16]/90 border border-white/10 text-xs font-mono text-[#A1ACBF] shadow-sm mb-10">
        <Terminal className="w-4 h-4 text-[#40D9F2] shrink-0" />
        <span className="text-[#737F93] select-none">$</span>
        <span className="text-[#F4F7FC]">npx @aixchange/sandbox start</span>
        <button
          onClick={handleCopyCli}
          aria-label="Copy CLI command"
          className="p-1 rounded hover:bg-[#0F1522] text-[#737F93] hover:text-[#F4F7FC] transition-colors ml-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Trust & Capability Indicators */}
      <div className="hero-anim-item flex flex-wrap items-center justify-center gap-6 text-xs text-[#737F93] font-mono">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SHA-256 Verified Lineage</span>
        </span>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#40D9F2]" />
          <span>Confidential Sandboxes</span>
        </span>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4F7DFF]" />
          <span>Zero-Leakage Royalties</span>
        </span>
      </div>
    </section>
  );
}
