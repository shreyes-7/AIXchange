import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Coins,
  Sparkles,
  Lock,
  Download,
} from "lucide-react";
import { Modal, Button, Badge } from "../common";
import { getSigner, getCurrentAccount } from "../../services/blockchain/wallet/metamask.service";
import {
  getAixTokenContract,
  allowance as getAllowance,
  approve,
} from "../../services/blockchain/token/token.service";
import {
  getPurchaseEngineAddress,
  executePurchase,
} from "../../services/blockchain/purchase/purchase.service";
import { syncPurchase } from "../../services/api/purchaseApi.service";

/**
 * PurchaseModal
 * 2-Step Atomic Purchase Engine Modal:
 * Step 1: Verify Balance & Approve AIX token allowance.
 * Step 2: Execute PurchaseEngine.purchaseDataset on-chain and sync with MongoDB.
 */
export default function PurchaseModal({
  isOpen,
  onClose,
  dataset,
  licenseTier = "Commercial",
  priceAix = 100,
  licenseId = 1,
  onSuccess,
}) {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [aixBalance, setAixBalance] = useState("0");
  const [currentAllowance, setCurrentAllowance] = useState("0");
  const [step, setStep] = useState(1); // 1 = Allowance/Prep, 2 = Purchase Exec, 3 = Receipt
  const [loading, setLoading] = useState(false);
  const [stageMessage, setStageMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const purchaseEngineAddr = getPurchaseEngineAddress();

  const checkState = useCallback(async () => {
    try {
      setError("");
      const acc = await getCurrentAccount();
      if (!acc) return;
      setAccount(acc);

      const signer = await getSigner();
      const tokenContract = getAixTokenContract(signer);
      const decimals = await tokenContract.decimals();

      // Check balance
      const bal = await tokenContract.balanceOf(acc);
      const formattedBal = ethers.formatUnits(bal, decimals);
      setAixBalance(formattedBal);

      // Check allowance
      const allowRaw = await tokenContract.allowance(acc, purchaseEngineAddr);
      const formattedAllow = ethers.formatUnits(allowRaw, decimals);
      setCurrentAllowance(formattedAllow);

      // If allowance is already enough, advance directly to step 2
      const numAllow = parseFloat(formattedAllow);
      if (numAllow >= Number(priceAix)) {
        setStep(2);
      } else {
        setStep(1);
      }
    } catch (err) {
      console.warn("PurchaseModal checkState error:", err);
    }
  }, [priceAix, purchaseEngineAddr]);

  useEffect(() => {
    if (isOpen) {
      setReceipt(null);
      checkState();
    }
  }, [isOpen, checkState]);

  const handleApprove = async (approveAmount = priceAix) => {
    setError("");
    setLoading(true);
    setStageMessage("Requesting token approval in MetaMask...");

    try {
      const signer = await getSigner();
      const tokenContract = getAixTokenContract(signer);
      const decimals = await tokenContract.decimals();

      let parsedAmount;
      if (approveAmount === "unlimited") {
        parsedAmount = ethers.MaxUint256;
      } else {
        parsedAmount = ethers.parseUnits(approveAmount.toString(), decimals);
      }

      const tx = await tokenContract.approve(purchaseEngineAddr, parsedAmount);
      setStageMessage("Mining token approval on-chain...");
      await tx.wait(1);

      // Advance to Step 2
      setStageMessage("");
      setStep(2);
      await checkState();
    } catch (err) {
      setError(err?.reason || err.message || "Approval transaction failed.");
    } finally {
      setLoading(false);
      setStageMessage("");
    }
  };

  const handleExecutePurchase = async () => {
    setError("");
    setLoading(true);

    try {
      const datasetOnChainId = dataset?.id || dataset?.datasetId || 1;
      const res = await executePurchase(datasetOnChainId, licenseId, (stage, msg) => {
        setStageMessage(msg);
      });

      // Synchronize with backend API
      try {
        await syncPurchase({ transactionHash: res.txHash });
      } catch (syncErr) {
        console.warn("Backend sync warning (on-chain was successful):", syncErr);
      }

      setReceipt({
        txHash: res.txHash,
        purchaseId: res.purchaseId || "1",
        licenseTier,
        amount: priceAix,
        timestamp: new Date().toLocaleTimeString(),
      });

      setStep(3);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err?.reason || err.message || "Purchase settlement failed.");
    } finally {
      setLoading(false);
      setStageMessage("");
    }
  };

  const handleClaimFaucet = async () => {
    try {
      setLoading(true);
      setError("");
      setStageMessage("Minting 1,000 AIX test tokens from faucet...");
      const signer = await getSigner();
      const tokenContract = getAixTokenContract(signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits("1000", decimals);
      const tx = await tokenContract.mint(account, parsedAmount);
      await tx.wait(1);
      await checkState();
    } catch (err) {
      setError(err?.reason || err.message || "Faucet mint failed.");
    } finally {
      setLoading(false);
      setStageMessage("");
    }
  };

  const hasEnoughBalance = parseFloat(aixBalance) >= Number(priceAix);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 3 ? "Purchase Receipt & Access Granted" : "Acquire Dataset License"}
      subtitle={
        dataset?.title
          ? `${dataset.title} (ID #${dataset.id || 1})`
          : "Trustless Web3 settlement with automated royalties"
      }
      icon={ShoppingCart}
      maxWidth="max-w-xl"
    >
      {/* Step 3: Receipt */}
      {step === 3 && receipt ? (
        <div className="text-center py-4 space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant="verified" size="sm" pulse className="mb-2">
              On-Chain Entitlement Confirmed
            </Badge>
            <h3 className="text-xl font-extrabold text-white">License Successfully Purchased!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your license entitlement is now cryptographically verified on `PurchaseEngine.sol`. Full dataset archive and decryption keys unlocked.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2.5 text-left">
            <div className="flex justify-between items-center text-slate-400">
              <span>License Granted:</span>
              <span className="text-cyan-300 font-bold">{receipt.licenseTier} Tier</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Amount Paid:</span>
              <span className="text-white font-bold">{receipt.amount} AIX</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Settlement Split:</span>
              <span className="text-emerald-400 font-semibold">97.5% Creator / 2.5% Treasury</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-slate-400">
              <span>Transaction Hash:</span>
              <span className="text-slate-300 truncate max-w-[200px]" title={receipt.txHash}>
                {receipt.txHash}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="primary"
              className="w-full"
              icon={Download}
              onClick={() => {
                onClose();
                navigate("/my-assets");
              }}
            >
              Go to My Assets
            </Button>
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Continue Browsing
            </Button>
          </div>
        </div>
      ) : (
        /* Steps 1 & 2 */
        <div className="space-y-5">
          {/* Stepper Indicator */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-center">
            <div
              className={`py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                step === 1
                  ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Approve Allowance</span>
            </div>
            <div
              className={`py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                step === 2
                  ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              <span>Settle Payment</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Selected Tier:</span>
              <Badge variant="brand" size="xs">
                {licenseTier} License
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Settlement Price:</span>
              <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
                {priceAix} <span className="text-xs text-cyan-400 font-semibold">AIX</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Your AIX Balance:</span>
              <span
                className={`font-bold ${
                  hasEnoughBalance ? "text-slate-200" : "text-rose-400"
                }`}
              >
                {parseFloat(aixBalance).toLocaleString()} AIX
              </span>
            </div>
          </div>

          {/* If user lacks AIX tokens */}
          {!hasEnoughBalance && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Insufficient AIX balance for this purchase.</span>
              </div>
              <Button
                variant="cyber"
                size="xs"
                loading={loading}
                onClick={handleClaimFaucet}
                icon={Sparkles}
              >
                +1,000 Faucet
              </Button>
            </div>
          )}

          {/* Step 1: Allowance Approval */}
          {step === 1 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Contract Approval Required</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Allow `PurchaseEngine.sol` to spend up to {priceAix} AIX on your behalf.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  disabled={loading || !hasEnoughBalance}
                  loading={loading}
                  onClick={() => handleApprove(priceAix)}
                  className="w-full"
                >
                  Approve {priceAix} AIX
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={loading || !hasEnoughBalance}
                  loading={loading}
                  onClick={() => handleApprove("unlimited")}
                  className="w-full font-mono text-xs"
                >
                  Approve Unlimited
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Settle Purchase */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Contract allowance verified! Ready to execute atomic settlement.</span>
              </div>

              {stageMessage && (
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-cyan-300 text-center animate-pulse">
                  {stageMessage}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                disabled={loading || !hasEnoughBalance}
                loading={loading}
                iconRight={ArrowRight}
                onClick={handleExecutePurchase}
                className="w-full font-bold shadow-lg shadow-cyan-500/20 py-3"
              >
                {loading ? "Confirming on Blockchain..." : `Buy License (${priceAix} AIX)`}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
