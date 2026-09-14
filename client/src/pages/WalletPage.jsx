import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Wallet, Coins, Send, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { getCurrentAccount, connectWallet, getSigner } from "../services/blockchain/wallet/metamask.service";
import { getBalance, transfer, approve, mint, getAixTokenAddress, getAixTokenContract } from "../services/blockchain/token/token.service";

export default function WalletPage() {
  const [account, setAccount] = useState("");
  const [aixBalance, setAixBalance] = useState("0.00");
  const [ethBalance, setEthBalance] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Transfer form
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Faucet
  const [minting, setMinting] = useState(false);

  const fetchBalances = async (targetAccount) => {
    if (!targetAccount) return;
    try {
      setLoading(true);
      setError("");

      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
      const ethBalRaw = await provider.getBalance(targetAccount);
      setEthBalance(Number(ethers.formatEther(ethBalRaw)).toFixed(4));

      const contract = getAixTokenContract(provider);
      const rawAix = await contract.balanceOf(targetAccount);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(rawAix, decimals);
      setAixBalance(Number(formatted).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    } catch (err) {
      console.warn("Balance fetch error:", err);
      setError("Failed to query live token balances from Hardhat node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const acc = await getCurrentAccount();
        setAccount(acc);
        if (acc) {
          await fetchBalances(acc);
        }
      } catch (err) {
        console.warn("Wallet init warning:", err);
      }
    }
    init();
  }, []);

  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
      if (acc) {
        await fetchBalances(acc);
      }
    } catch (err) {
      setError(err.message || "Failed to connect MetaMask.");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!account) return setError("Please connect your wallet first.");
    if (!recipient || !transferAmount) return setError("Recipient and amount are required.");

    setError("");
    setSuccess("");
    setTransferring(true);

    try {
      const signer = await getSigner();
      const contract = getAixTokenContract(signer);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(transferAmount.toString(), decimals);

      const tx = await contract.transfer(recipient, parsedAmount);
      await tx.wait(1);

      setSuccess(`Transferred ${transferAmount} AIX to ${recipient.slice(0, 8)}...! Tx: ${tx.hash.slice(0, 14)}...`);
      setRecipient("");
      setTransferAmount("");
      await fetchBalances(account);
    } catch (err) {
      setError(err.message || "Transfer transaction failed.");
    } finally {
      setTransferring(false);
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

      setSuccess(`Claimed 1,000 AIX test tokens successfully! Tx: ${tx.hash.slice(0, 14)}...`);
      await fetchBalances(account);
    } catch (err) {
      setError(err.message || "Faucet mint transaction failed.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <PublicShell>
      <div className="max-w-5xl mx-auto my-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Coins className="w-3.5 h-3.5" />
              Web3 Financial Substrate
            </div>
            <h1 className="text-3xl font-extrabold text-white">AIX Token & Treasury Hub</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your AIX utility token balances, execute payments, and inspect smart contract allowances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => account && fetchBalances(account)}
              disabled={loading || !account}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              Refresh Balances
            </button>
            {!account && (
              <button
                onClick={handleConnect}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>AIX Token Balance</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
              {aixBalance} <span className="text-sm font-semibold text-cyan-400">AIX</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Contract Address:</span>
              <span className="font-mono text-slate-400 truncate max-w-[140px]">
                {getAixTokenAddress().slice(0, 8)}...{getAixTokenAddress().slice(-6)}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Native ETH Balance (Gas)</span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
              {ethBalance} <span className="text-sm font-semibold text-indigo-400">ETH</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Network:</span>
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Hardhat Local (31337)
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Connected Signer</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-mono font-bold text-slate-200 truncate pt-2">
              {account || "Wallet Not Connected"}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Dev Test Faucet:</span>
              <button
                onClick={handleClaimFaucet}
                disabled={minting || !account}
                className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-all disabled:opacity-50"
              >
                {minting ? "Minting..." : "+1,000 AIX Faucet"}
              </button>
            </div>
          </div>
        </div>

        {/* Transfer & Allowance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Form */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Transfer AIX Tokens
            </h2>
            <p className="text-xs text-slate-400">
              Direct peer-to-peer ERC-20 transfer on AIXchange substrate.
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Recipient Ethereum Address
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Amount (AIX)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={transferring || !account}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferring ? "Confirming in MetaMask..." : "Execute Token Transfer"}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Smart Contract Interaction Reference */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Smart Contract Architecture Reference
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              AIX is the ERC-20 utility substrate powering all marketplace settlements, atomic purchase routing, and automated secondary royalty splits.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Token Standard:</span>
                <span className="text-cyan-300 font-bold">ERC-20 (OpenZeppelin v5)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Platform Treasury Fee:</span>
                <span className="text-purple-300 font-bold">2.50% (250 BPS)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Creator Settlement:</span>
                <span className="text-emerald-300 font-bold">97.50% Direct to Licensor</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/wallet-test"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Advanced Developer Blockchain Testbed →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
