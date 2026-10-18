import React, { useState } from "react";
import { ethers } from "ethers";
import { Send, ArrowUpRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal, Button, Input, Badge } from "../common";
import { getSigner } from "../../services/blockchain/wallet/metamask.service";
import { getAixTokenContract } from "../../services/blockchain/token/token.service";

/**
 * TokenTransferModal
 * Dialog for sending AIX utility tokens directly to another wallet address.
 */
export default function TokenTransferModal({
  isOpen,
  onClose,
  account,
  currentBalance = "0",
  onSuccess,
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleMax = () => {
    // Leave a small buffer or set full AIX balance (ERC20 doesn't pay gas)
    const cleaned = currentBalance.replace(/,/g, "");
    setAmount(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTxHash("");

    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }

    if (!recipient || !amount) {
      setError("Please enter both recipient address and amount.");
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError("Invalid Ethereum wallet address.");
      return;
    }

    const numAmount = parseFloat(amount);
    const numBalance = parseFloat(currentBalance.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (numAmount > numBalance) {
      setError("Insufficient AIX token balance.");
      return;
    }

    setLoading(true);

    try {
      const signer = await getSigner();
      const contract = getAixTokenContract(signer);
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      const tx = await contract.transfer(recipient, parsedAmount);
      const receipt = await tx.wait(1);

      setTxHash(tx.hash);
      if (onSuccess) {
        onSuccess({ txHash: tx.hash, recipient, amount });
      }
    } catch (err) {
      const msg = err?.reason || err?.message || "Transfer transaction failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setError("");
    setTxHash("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Transfer AIX Tokens"
      subtitle="Send ERC-20 utility tokens on the AIXchange substrate"
      icon={Send}
      maxWidth="max-w-lg"
    >
      {txHash ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-white">Transfer Confirmed!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Transferred <span className="text-cyan-300 font-mono font-bold">{amount} AIX</span> to{" "}
              <span className="font-mono text-slate-300">
                {recipient.slice(0, 6)}...{recipient.slice(-4)}
              </span>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Available Balance:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{currentBalance} AIX</span>
              <button
                type="button"
                onClick={handleMax}
                className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold hover:bg-cyan-500/20"
              >
                Max
              </button>
            </div>
          </div>

          <Input
            label="Recipient Address"
            type="text"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            monospace
          />

          <Input
            label="Amount (AIX)"
            type="number"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            monospace
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Network: Hardhat Local / Sepolia</span>
            <span>Fee: Standard ERC-20 Gas</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              iconRight={ArrowUpRight}
            >
              {loading ? "Confirming in MetaMask..." : "Send AIX Tokens"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
