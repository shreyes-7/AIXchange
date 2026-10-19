import React from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

export default function TxStepperModal({
  isOpen,
  onClose,
  currentStep = 1, // 1: Broadcasting, 2: Mining, 3: Confirmed, -1: Failed
  title = "Processing Web3 Transaction",
  txHash = "",
  errorMessage = "",
  onRetry,
}) {
  const steps = [
    { id: 1, label: "Sign & Broadcast", desc: "Awaiting signature from wallet" },
    { id: 2, label: "EVM Mining", desc: "Validating across consensus nodes" },
    { id: 3, label: "Cryptographically Anchored", desc: "State updated on-chain" },
  ];

  const isFailed = currentStep === -1;
  const isComplete = currentStep >= 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isComplete || isFailed ? onClose : () => {}}
      title={
        <div className="flex items-center gap-2">
          {isFailed ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : isComplete ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          )}
          <span className="font-bold text-white text-base">{title}</span>
        </div>
      }
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          {isFailed && onRetry && (
            <Button variant="primary" size="sm" onClick={onRetry}>
              Retry Transaction
            </Button>
          )}
          {(isComplete || isFailed) && (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Step Progress Tracker */}
        <div className="space-y-3">
          {steps.map((st) => {
            const isDone = currentStep > st.id || isComplete;
            const isCurrent = currentStep === st.id && !isFailed;
            const isPending = currentStep < st.id && !isFailed;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : isCurrent
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isDone
                        ? "bg-emerald-500 text-slate-950"
                        : isCurrent
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : st.id}
                  </div>
                  <div>
                    <span className="font-bold block text-white text-xs">{st.label}</span>
                    <span className="text-[10px] text-slate-400">{st.desc}</span>
                  </div>
                </div>

                {isCurrent && (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Transaction Receipt Hash:</span>
            <div className="flex items-center justify-between gap-2 text-cyan-400 text-xs font-semibold">
              <span className="truncate">{txHash}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        )}

        {/* Error message */}
        {isFailed && errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <span className="font-bold block">Execution Failed</span>
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
