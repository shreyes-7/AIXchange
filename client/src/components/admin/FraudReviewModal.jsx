import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Terminal,
} from "lucide-react";
import Button from "../common/Button";

export default function FraudReviewModal({ flag, isOpen, onClose, onReview }) {
  const [reviewStatus, setReviewStatus] = useState("RESOLVED");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !flag) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReview(flag._id || flag.flagId, {
        status: reviewStatus,
        notes: adminNotes || `Reviewed as ${reviewStatus} by administrator.`,
      });
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Anomaly Audit & Evidence Review
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Flag ID: {flag.flagId}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Invariant Notice */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 font-mono text-xs text-cyan-200 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Safety Invariant Enforced</span>
            Deterministic fraud flags strictly generate audit trails for human review. Resolving or dismissing flags never executes automated state changes or account locks.
          </div>
        </div>

        {/* Flag Details Grid */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Anomaly Rule:</span>
            <div className="font-bold text-white">{flag.ruleName || flag.ruleId}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Severity Tier:</span>
            <div className="font-bold text-rose-400">{flag.severity}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Target Address:</span>
            <div className="font-bold text-cyan-300 truncate">{flag.address}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Current Status:</span>
            <div className="font-bold text-amber-300">{flag.status}</div>
          </div>
        </div>

        {/* Evidence Block */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
          <span className="text-slate-400 flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            Deterministic Evidence Breakdown:
          </span>
          <pre className="text-slate-300 overflow-x-auto p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] leading-relaxed">
            {JSON.stringify(flag.evidence || {}, null, 2)}
          </pre>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              Resolution Disposition:
            </label>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setReviewStatus("RESOLVED")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  reviewStatus === "RESOLVED"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                RESOLVED
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus("DISMISSED")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  reviewStatus === "DISMISSED"
                    ? "bg-slate-800 border-slate-700 text-slate-200 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                DISMISSED
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus("ESCALATED")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  reviewStatus === "ESCALATED"
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                ESCALATED
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 block">
              Administrative Audit Rationale:
            </label>
            <textarea
              rows={2}
              required
              placeholder="Provide evidence confirmation or governance motion notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={isSubmitting}
            >
              Commit Audit Resolution
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
