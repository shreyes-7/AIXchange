import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAccount,
  getNetwork,
  onAccountsChanged,
  removeAccountsChangedListener,
  onChainChanged,
  removeChainChangedListener,
} from '@/services/blockchain/wallet';
import {
  connectStart,
  connectSuccess,
  disconnectWallet,
  setChainId,
} from '@/store/slices/walletSlice';
import { Cpu, Wallet, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { address, isConnected, aixBalance } = useSelector((state) => state.wallet);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchAixBalance = async (userAddress) => {
    try {
      const rpcUrl = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      const tokenAddress = import.meta.env.VITE_AIX_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const bal = await tokenContract.balanceOf(userAddress);
      const formatted = ethers.formatUnits(bal, 18);
      const num = parseFloat(formatted);
      if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
      if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
      if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } catch {
      return '0';
    }
  };

  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    async function checkConnected() {
      try {
        const current = await getCurrentAccount();
        if (current) {
          const net = await getNetwork();
          setNetwork(net);
          const bal = await fetchAixBalance(current);
          dispatch(
            connectSuccess({
              address: current,
              chainId: net?.chainId,
              aixBalance: bal,
            })
          );
        }
      } catch (err) {
        console.warn('Wallet status check warning:', err.message);
      }
    }
    checkConnected();

    const handleAccounts = async (accounts) => {
      if (accounts.length) {
        const net = await getNetwork();
        setNetwork(net);
        const bal = await fetchAixBalance(accounts[0]);
        dispatch(connectSuccess({ address: accounts[0], chainId: net?.chainId, aixBalance: bal }));
      } else {
        dispatch(disconnectWallet());
      }
    };

    const handleChain = (chainId) => {
      dispatch(setChainId(chainId));
      window.location.reload();
    };

    onAccountsChanged(handleAccounts);
    onChainChanged(handleChain);

    return () => {
      removeAccountsChangedListener(handleAccounts);
      removeChainChangedListener(handleChain);
    };
  }, [dispatch]);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to connect your Web3 wallet.');
      return;
    }
    try {
      setIsConnecting(true);
      dispatch(connectStart());
      const acc = await connectWallet();
      const net = await getNetwork();
      setNetwork(net);
      const bal = await fetchAixBalance(acc);
      dispatch(
        connectSuccess({
          address: acc,
          chainId: net?.chainId,
          aixBalance: bal,
        })
      );
    } catch (err) {
      console.error('Wallet connect failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/datasets', label: 'Datasets' },
    { to: '/models', label: 'Models' },
    { to: '/sandboxes', label: 'Sandboxes' },
    { to: '/provenance', label: 'Lineage DAG' },
    { to: '/inference', label: 'Inference' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/wallet', label: 'Wallet' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                AIX<span className="text-cyan-400">change</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              </span>
              <span className="text-[9px] font-mono block text-slate-400 tracking-widest uppercase -mt-0.5">
                Decentralized Substrate
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                location.pathname === link.to ||
                (link.to === '/datasets' && location.pathname.startsWith('/datasets'));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Network, Balance, Wallet, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Indicator */}
          {network && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{network.name || `Chain ${network.chainId}`}</span>
            </div>
          )}

          {/* AIX Token Balance Badge */}
          {isConnected && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-300">
              <span className="text-[10px] text-cyan-500 font-semibold">AIX:</span>
              <span>{aixBalance || '0.00'}</span>
            </div>
          )}

          {/* Wallet Connection Button */}
          {address ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
