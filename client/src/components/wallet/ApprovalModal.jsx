import React, { useState } from "react";
import { ethers } from "ethers";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Modal, Button, Input, Badge } from "../common";
import { getSigner } from "../../services/blockchain/wallet/metamask.service";
import { getAixTokenContract } from "../../services/blockchain/token/token.service";
import { getPurchaseEngineAddress } from "../../services/blockchain/purchase/purchase.service";

/**
 * ApprovalModal
 * Dialog for approving smart contracts (e.g. PurchaseEngine) to spend AIX tokens on the user's behalf.
 */
export default function ApprovalModal({
  isOpen,
  onClose,
  account,
  currentAllowance = "0",
  onSuccess,
}) {
  const [spender, setSpender] = useState(getPurchaseEngineAddress());
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleApprove = async (amountToApprove) => {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }

    setError("");
    setTxHash("");
    setLoading(true);

    try {
      const signer = await getSigner();
      const contract = getAixTokenContract(signer);
      const decimals = await contract.decimals();

      let parsedAmount;
      if (amountToApprove === "unlimited") {
        parsedAmount = ethers.MaxUint256;
      } else {
        parsedAmount = ethers.parseUnits(amountToApprove.toString(), decimals);
      }

      const tx = await contract.approve(spender, parsedAmount);
      await tx.wait(1);

      setTxHash(tx.hash);
      if (onSuccess) {
        onSuccess({ txHash: tx.hash, spender, amount: amountToApprove });
      }
    } catch (err) {
      const msg = err?.reason || err?.message || "Contract approval failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setError("");
    setTxHash("");
    setCustomAmount("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Manage Marketplace Allowance"
      subtitle="Approve PurchaseEngine.sol to spend AIX tokens for dataset & model purchases"
      icon={ShieldCheck}
      maxWidth="max-w-lg"
    >
      {txHash ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-white">Allowance Approved!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Smart contract allowance has been successfully updated on-chain.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 break-all text-left">
            <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
              Transaction Hash:
            </span>
            {txHash}
          </div>

          <Button variant="secondary" onClick={handleReset} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Target Spender:</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[200px]">
                PurchaseEngine.sol
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {spender}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
              <span className="text-slate-400">Current Allowance:</span>
              <Badge variant="web3" size="sm">
                {currentAllowance} AIX
              </Badge>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Select a preset approval amount or enter a custom limit. Approving an allowance allows the marketplace purchase engine to atomically settle your license acquisitions.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleApprove("500")}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-center transition-all disabled:opacity-50"
            >
              <div className="text-sm font-bold text-white font-mono">500</div>
              <div className="text-[10px] text-slate-400 font-mono">AIX</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleApprove("5000")}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-center transition-all disabled:opacity-50"
            >
              <div className="text-sm font-bold text-white font-mono">5,000</div>
              <div className="text-[10px] text-slate-400 font-mono">AIX</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleApprove("unlimited")}
              className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 text-center transition-all disabled:opacity-50"
            >
              <div className="text-sm font-bold text-cyan-300 font-mono">Unlimited</div>
              <div className="text-[10px] text-cyan-500 font-mono">MaxUint256</div>
            </button>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-900 text-[10px] font-mono uppercase text-slate-500">
              Or Custom Amount
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="any"
                placeholder="Custom AIX amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                monospace
              />
            </div>
            <Button
              variant="primary"
              disabled={!customAmount || loading}
              loading={loading}
              onClick={() => handleApprove(customAmount)}
            >
              Approve
            </Button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={handleReset} disabled={loading}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
