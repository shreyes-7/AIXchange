import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import Button from "../common/Button";

export default function FraudDetectionTable({ flags = [], onSelectFlag }) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFlags = flags.filter((f) => {
    if (filterSeverity !== "ALL" && f.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && f.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAddr = f.address?.toLowerCase().includes(q);
      const matchRule = f.ruleName?.toLowerCase().includes(q) || f.ruleId?.toLowerCase().includes(q);
      const matchDesc = f.description?.toLowerCase().includes(q);
      if (!matchAddr && !matchRule && !matchDesc) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "DISMISSED":
        return "bg-slate-800 text-slate-400 border-slate-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by address, rule ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Severity */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSeverity(s)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterSeverity === s
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {["ALL", "PENDING_REVIEW", "RESOLVED", "DISMISSED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatus === st
                    ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st === "PENDING_REVIEW" ? "Pending" : st === "RESOLVED" ? "Resolved" : st === "DISMISSED" ? "Dismissed" : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud Flags Table */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Deterministic Anomaly Flags Queue
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Explainable rule-based flags generated by Phase 12 Blockchain Monitoring Engine
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredFlags.length} of {flags.length} anomaly records
          </span>
        </div>

        {filteredFlags.length === 0 ? (
          <div className="text-center py-12 font-mono text-xs text-slate-500">
            No fraud flags matched the active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Rule Triggered</th>
                  <th className="pb-3 font-semibold">Target Address</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFlags.map((flag) => (
                  <tr key={flag._id || flag.flagId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(flag.severity)}`}>
                        {flag.severity}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">{flag.ruleName || flag.ruleId}</td>
                    <td className="py-3 text-cyan-400 truncate max-w-[150px]">
                      {flag.address}
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{flag.description}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadge(flag.status)}`}>
                        {flag.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={<Eye className="w-3 h-3" />}
                        onClick={() => onSelectFlag && onSelectFlag(flag)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
