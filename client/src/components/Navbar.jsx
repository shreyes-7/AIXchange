import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  connectWallet,
  getCurrentAccount,
  getNetwork,
  onAccountsChanged,
  removeAccountsChangedListener,
  onChainChanged,
  removeChainChangedListener,
} from "../services/blockchain/wallet";

export default function Navbar() {
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function checkConnected() {
      try {
        const current = await getCurrentAccount();
        setAccount(current);
        if (current) {
          const net = await getNetwork();
          setNetwork(net);
        }
      } catch (err) {
        console.warn("Wallet status check error:", err.message);
      }
    }
    checkConnected();

    const handleAccounts = (accounts) => {
      setAccount(accounts.length ? accounts[0] : null);
    };
    const handleChain = () => {
      window.location.reload();
    };

    onAccountsChanged(handleAccounts);
    onChainChanged(handleChain);

    return () => {
      removeAccountsChangedListener(handleAccounts);
      removeChainChangedListener(handleChain);
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const acc = await connectWallet();
      setAccount(acc);
      const net = await getNetwork();
      setNetwork(net);
    } catch (err) {
      console.error("Connect failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const navLinks = [
    { to: "/datasets", label: "Dataset Marketplace" },
    { to: "/datasets/register", label: "Register Dataset" },
    { to: "/wallet-test", label: "Wallet Test Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/datasets" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              AI
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                AIXchange
              </span>
              <span className="text-[10px] font-mono block text-cyan-400 -mt-1 tracking-widest uppercase">
                Phase 4 Marketplace
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                location.pathname === link.to ||
                (link.to === "/datasets" && location.pathname === "/");
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {network && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{network.name || `Chain ${network.chainId}`}</span>
            </div>
          )}

          {account ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
