import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  Wallet,
  Coins,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ExternalLink,
  History,
  Lock,
} from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { Button, Badge } from "../components/common";
import { TokenTransferModal, ApprovalModal } from "../components/wallet";
import {
  getCurrentAccount,
  connectWallet,
  getSigner,
  getNetwork,
} from "../services/blockchain/wallet/metamask.service";
import {
  getAixTokenAddress,
  getAixTokenContract,
} from "../services/blockchain/token/token.service";
import { getPurchaseEngineAddress } from "../services/blockchain/purchase/purchase.service";
import {
  connectSuccess,
  updateBalances,
} from "../store/slices/walletSlice";

export default function WalletPage() {
  const dispatch = useDispatch();
  const reduxWallet = useSelector((state) => state.wallet);

  const [account, setAccount] = useState(reduxWallet.address || "");
  const [networkInfo, setNetworkInfo] = useState(null);
  const [aixBalance, setAixBalance] = useState(reduxWallet.aixBalance || "0.00");
  const [ethBalance, setEthBalance] = useState(reduxWallet.ethBalance || "0.00");
  const [allowance, setAllowance] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  // Faucet state
  const [minting, setMinting] = useState(false);

  // Recent activity log in session
  const [activityLog, setActivityLog] = useState([
    {
      id: "genesis-0",
      type: "SYSTEM_READY",
      label: "Substrate Contract Initialized",
      hash: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const fetchBalances = useCallback(async (targetAccount) => {
    if (!targetAccount) return;
    try {
      setLoading(true);
      setError("");

      const rpcUrl = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // 1. ETH Balance
      const ethBalRaw = await provider.getBalance(targetAccount);
      const formattedEth = Number(ethers.formatEther(ethBalRaw)).toFixed(4);
      setEthBalance(formattedEth);

      // 2. AIX Token Balance
      const contract = getAixTokenContract(provider);
      const rawAix = await contract.balanceOf(targetAccount);
      const decimals = await contract.decimals();
      const formattedAix = ethers.formatUnits(rawAix, decimals);
      const displayAix = Number(formattedAix).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
      setAixBalance(displayAix);

      // 3. PurchaseEngine Allowance
      const purchaseEngineAddr = getPurchaseEngineAddress();
      const rawAllowance = await contract.allowance(targetAccount, purchaseEngineAddr);
      if (rawAllowance === ethers.MaxUint256) {
        setAllowance("Unlimited");
      } else {
        const formattedAllow = ethers.formatUnits(rawAllowance, decimals);
        setAllowance(Number(formattedAllow).toLocaleString(undefined, { maximumFractionDigits: 2 }));
      }

      // 4. Update Redux store
      dispatch(
        updateBalances({
          aixBalance: displayAix,
          ethBalance: formattedEth,
        })
      );
    } catch (err) {
      console.warn("Balance fetch error:", err);
      setError("Failed to query live token balances from Hardhat/blockchain node.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    async function init() {
      try {
        const acc = await getCurrentAccount();
        if (acc) {
          setAccount(acc);
          const net = await getNetwork();
          setNetworkInfo(net);
          await fetchBalances(acc);
        }
      } catch (err) {
        console.warn("Wallet init warning:", err);
      }
    }
    init();
  }, [fetchBalances]);

  const handleConnect = async () => {
    try {
      setError("");
      const acc = await connectWallet();
      setAccount(acc);
      const net = await getNetwork();
      setNetworkInfo(net);
      if (acc) {
        await fetchBalances(acc);
        dispatch(
          connectSuccess({
            address: acc,
            chainId: net?.chainId,
            aixBalance,
            ethBalance,
          })
        );
      }
    } catch (err) {
      setError(err.message || "Failed to connect MetaMask.");
    }
  };

  const handleClaimFaucet = async () => {
    if (!account) return setError("Please connect your wallet first.");
    setError("");
    setSuccess("");
    setMinting(true);

    try {
      const signer = await getSigner();
      const contract = getAixTokenContract(signer);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits("1000", decimals);

      const tx = await contract.mint(account, parsedAmount);
      await tx.wait(1);

      setSuccess(`Claimed 1,000 AIX test tokens successfully!`);
      setActivityLog((prev) => [
        {
          id: tx.hash,
          type: "FAUCET_MINT",
          label: "Claimed +1,000 AIX from Testbed Faucet",
          hash: tx.hash,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      await fetchBalances(account);
    } catch (err) {
      setError(err?.reason || err.message || "Faucet mint transaction failed.");
    } finally {
      setMinting(false);
    }
  };

  const handleTransferSuccess = ({ txHash, recipient, amount }) => {
    setSuccess(`Transferred ${amount} AIX to ${recipient.slice(0, 8)}...!`);
    setActivityLog((prev) => [
      {
        id: txHash,
        type: "TRANSFER",
        label: `Transferred ${amount} AIX to ${recipient.slice(0, 8)}...`,
        hash: txHash,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    if (account) fetchBalances(account);
  };

  const handleApprovalSuccess = ({ txHash, amount }) => {
    setSuccess(`Approved ${amount} AIX allowance for PurchaseEngine!`);
    setActivityLog((prev) => [
      {
        id: txHash,
        type: "APPROVAL",
        label: `Approved ${amount} AIX for PurchaseEngine.sol`,
        hash: txHash,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    if (account) fetchBalances(account);
  };

  return (
    <PublicShell>
      <div className="max-w-6xl mx-auto my-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="web3" size="xs" pulse>
                <Coins className="w-3.5 h-3.5" />
                Web3 Financial Substrate
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AIX Token & Treasury Terminal
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Inspect your AIX utility token balances, execute peer-to-peer transfers, and configure smart contract allowances for dataset purchases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !account}
              onClick={() => account && fetchBalances(account)}
              icon={RefreshCw}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            {!account && (
              <Button variant="primary" size="sm" onClick={handleConnect}>
                Connect MetaMask
              </Button>
            )}
          </div>
        </div>

        {/* Banners */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* 3 Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AIX Token Balance Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <Coins className="w-4 h-4 text-cyan-400" />
                AIX Token Balance
              </span>
              <Badge variant="web3" size="xs">ERC-20</Badge>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
              {aixBalance} <span className="text-sm font-semibold text-cyan-400">AIX</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <Button
                variant="primary"
                size="xs"
                disabled={!account}
                onClick={() => setTransferModalOpen(true)}
                icon={Send}
                className="flex-1"
              >
                Send Tokens
              </Button>
              <Button
                variant="cyber"
                size="xs"
                disabled={minting || !account}
                loading={minting}
                onClick={handleClaimFaucet}
                icon={Sparkles}
                className="flex-1"
              >
                +1,000 Faucet
              </Button>
            </div>
          </div>

          {/* Native ETH Balance (Gas) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <Wallet className="w-4 h-4 text-indigo-400" />
                Gas Balance (ETH)
              </span>
              <Badge variant="brand" size="xs">Execution Gas</Badge>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
              {ethBalance} <span className="text-sm font-semibold text-indigo-400">ETH</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Network:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {networkInfo?.name || "Hardhat Local (31337)"}
              </span>
            </div>
          </div>

          {/* PurchaseEngine Allowance */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <Lock className="w-4 h-4 text-purple-400" />
                Marketplace Allowance
              </span>
              <Badge variant="compute" size="xs">PurchaseEngine</Badge>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
              {allowance} <span className="text-sm font-semibold text-purple-400">AIX</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Purchase Limit:</span>
              <Button
                variant="secondary"
                size="xs"
                disabled={!account}
                onClick={() => setApprovalModalOpen(true)}
                icon={ShieldCheck}
              >
                Manage Allowance
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Info & Interactive Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Smart Contract Infrastructure Card */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Decentralized Token Architecture
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              AIX is the ERC-20 utility substrate powering all marketplace settlements, atomic purchase routing, and automated secondary royalty splits.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">AIX Token Contract:</span>
                <span className="text-cyan-300 font-bold truncate max-w-[200px]" title={getAixTokenAddress()}>
                  {getAixTokenAddress()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Purchase Engine Spender:</span>
                <span className="text-purple-300 font-bold truncate max-w-[200px]" title={getPurchaseEngineAddress()}>
                  {getPurchaseEngineAddress()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Platform Treasury Fee:</span>
                <span className="text-indigo-300 font-bold">2.50% (250 BPS)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Creator Proceed Allocation:</span>
                <span className="text-emerald-300 font-bold">97.50% Direct to Licensor</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <Link
                to="/wallet-test"
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
              >
                Developer Sandbox Testbed <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/datasets"
                className="text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1"
              >
                Browse Datasets →
              </Link>
            </div>
          </div>

          {/* Recent Transaction Activity */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Session Blockchain Activity
              </h2>
              <Badge variant="neutral" size="xs">Live State</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Audit trail of all on-chain actions confirmed during your active browser session.
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {activityLog.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">{item.label}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{item.hash}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 font-mono">
              *Full persistent history available via indexed block explorer.
            </div>
          </div>
        </div>

        {/* Token Transfer Modal */}
        <TokenTransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          account={account}
          currentBalance={aixBalance}
          onSuccess={handleTransferSuccess}
        />

        {/* Approval Modal */}
        <ApprovalModal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          account={account}
          currentAllowance={allowance}
          onSuccess={handleApprovalSuccess}
        />
      </div>
    </PublicShell>
  );
}
