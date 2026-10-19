import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { logout } from '@/store/slices/authSlice';
import { logoutUser } from '@/services/api/authApi.service';
import {
  Cpu,
  Wallet,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Database,
  Layers,
  Sparkles,
  GitBranch,
  Shield,
  BarChart3,
  Coins,
  Settings,
  ChevronDown,
  Box,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address, isConnected, aixBalance } = useSelector((state) => state.wallet);
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors on logout
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

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
    let mounted = true;

    async function checkConnected() {
      try {
        const current = await getCurrentAccount();
        if (current && mounted) {
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
      if (!mounted) return;
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
      mounted = false;
      removeAccountsChangedListener(handleAccounts);
      removeChainChangedListener(handleChain);
    };
  }, [dispatch]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      dispatch(connectStart());
      const acc = await connectWallet();
      if (!acc) return;
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
      alert(err.message || 'Failed to connect MetaMask.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Clean, focused desktop primary links (4 core items)
  const primaryLinks = [
    { to: '/datasets', label: 'Datasets', icon: Database },
    { to: '/models', label: 'Models', icon: Layers },
    { to: '/inference', label: 'Inference', icon: Sparkles },
    { to: '/provenance', label: 'Lineage DAG', icon: GitBranch },
  ];

  // Full feature navigation groups for the organized Hamburger Menu
  const menuCategories = [
    {
      title: 'Marketplace & Assets',
      items: [
        { to: '/datasets', label: 'Dataset Catalog', desc: 'Browse verifiable training datasets' },
        { to: '/datasets/register', label: 'Register Dataset', desc: '10-step wizard to upload & anchor' },
        { to: '/models', label: 'Model Marketplace', desc: 'AI weights with SHA-256 digests' },
        { to: '/models/register', label: 'Register Model', desc: 'Anchor trained weights on-chain' },
        { to: '/my-assets', label: 'My Purchased Assets', desc: 'Centralized downloads library' },
      ],
    },
    {
      title: 'AI Studio & Compute',
      items: [
        { to: '/inference', label: 'Inference Playground', desc: 'Live tensor testing with schema sliders' },
        { to: '/sandboxes', label: 'Training Sandboxes', desc: 'Isolated Docker training & Jupyter' },
        { to: '/provenance', label: 'Lineage DAG Explorer', desc: 'Interactive provenance visualizer' },
      ],
    },
    {
      title: 'Ecosystem & Governance',
      items: [
        { to: '/royalties', label: 'Royalty Engine', desc: 'Multi-party revenue split trees' },
        { to: '/analytics', label: 'BI Analytics Deck', desc: 'Platform KPIs, volume & gas telemetry' },
        { to: '/admin', label: 'Admin Mission Control', desc: 'Fraud review & treasury vault audit' },
        { to: '/wallet', label: 'Web3 Wallet Terminal', desc: 'AIX balance & contract allowances' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#05070B]/85 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Explore Hamburger Button + Brand + Desktop Core Nav */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Explore / Hamburger Button at Extreme Left */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              menuOpen
                ? 'bg-[#0F1522] border-[#40D9F2]/50 text-[#40D9F2] shadow-[#40D9F2]/20'
                : 'bg-[#0A0E16] border-white/10 text-[#A1ACBF] hover:text-[#F4F7FC] hover:border-white/20 hover:bg-[#0F1522]'
            }`}
            title="Explore all AIXchange tools and portals"
          >
            {menuOpen ? <X className="w-4 h-4 text-[#40D9F2]" /> : <Menu className="w-4 h-4 text-[#40D9F2]" />}
            <span className="font-semibold text-xs">Explore</span>
          </button>

          {/* AIXchange Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#40D9F2] via-[#3976F6] to-[#4F7DFF] flex items-center justify-center font-bold text-white shadow-md shadow-[#3976F6]/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#F4F7FC] flex items-center gap-1">
                AIX<span className="text-[#40D9F2]">change</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#40D9F2] animate-pulse inline-block" />
              </span>
              <span className="text-[9px] font-mono block text-[#737F93] tracking-widest uppercase -mt-0.5">
                Decentralized Substrate
              </span>
            </div>
          </Link>

          {/* Clean Desktop Navigation (Uncluttered, 4 core items) */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {primaryLinks.map((link) => {
              const active =
                location.pathname === link.to ||
                (link.to === '/datasets' && location.pathname.startsWith('/datasets')) ||
                (link.to === '/models' && location.pathname.startsWith('/models')) ||
                (link.to === '/provenance' && location.pathname.startsWith('/provenance'));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#0F1522] text-[#40D9F2] shadow-sm border border-white/10'
                      : 'text-[#A1ACBF] hover:text-[#F4F7FC] hover:bg-[#0A0E16]'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5 opacity-70" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Actions: Network, AIX Balance, Wallet & Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Network Indicator */}
          {network && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A0E16] border border-white/10 text-[11px] font-mono text-[#A1ACBF]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chain {network.chainId}</span>
            </div>
          )}

          {/* AIX Token Balance Badge */}
          {isConnected && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F1522] border border-[#40D9F2]/30 text-xs font-mono text-[#40D9F2]">
              <span className="text-[10px] text-[#737F93] font-semibold">AIX:</span>
              <span>{aixBalance || '0.00'}</span>
            </div>
          )}

          {/* Wallet Address / Connect Button */}
          {address ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0A0E16] border border-white/10 text-xs font-mono text-[#F4F7FC] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3976F6] hover:bg-[#4F7DFF] text-white text-xs font-semibold shadow-sm shadow-[#3976F6]/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? '...' : 'Connect'}</span>
            </button>
          )}

          {/* User Profile Badge & Obvious Front LOGOUT Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A0E16] border border-white/10 text-xs hover:border-[#40D9F2]/50 hover:bg-[#0F1522] transition-all"
                title="Account Profile & Settings"
              >
                <User className="w-3.5 h-3.5 text-[#40D9F2]" />
                <span className="text-[#F4F7FC] font-medium max-w-[90px] truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Member'}
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4F7DFF]/15 text-[#40D9F2] border border-[#4F7DFF]/30">
                  {role || user?.role || 'user'}
                </span>
              </Link>

              {/* PROMINENT LOGOUT BUTTON AT FRONT */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all shadow-sm"
                title="Sign out of your session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#A1ACBF] hover:text-[#F4F7FC] hover:bg-[#0A0E16] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3976F6] hover:bg-[#4F7DFF] text-white transition-all shadow-sm shadow-[#3976F6]/20"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modern Organized Slide-Down Cyber Hamburger Drawer */}
      {menuOpen && (
        <div className="border-b border-white/[0.08] bg-[#05070B]/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {menuCategories.map((cat) => (
                <div key={cat.title} className="p-4 rounded-2xl bg-[#0A0E16] border border-white/[0.08]">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#40D9F2] font-bold mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#40D9F2]" />
                    {cat.title}
                  </h4>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className={`block p-2 rounded-xl transition-all ${
                            location.pathname === item.to
                              ? 'bg-[#0F1522] text-[#40D9F2] border border-white/10'
                              : 'text-[#A1ACBF] hover:text-[#F4F7FC] hover:bg-[#0F1522]/60'
                          }`}
                        >
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className="text-[11px] text-[#737F93] line-clamp-1">{item.desc}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Account & Session Bar inside Menu */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Signed in as <strong className="text-white">{user?.name || user?.email}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono uppercase text-[10px]">
                      {role || user?.role || 'user'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Not authenticated. Sign in or connect wallet to access features.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white"
                    >
                      Profile & Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
