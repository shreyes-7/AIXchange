import React, { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Button from "../common/Button";

export default function ReportResolutionQueue({ reports = [], onUpdateStatus }) {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = reports.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    return true;
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "IN_REVIEW":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
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
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            User Complaint & Moderation Queue
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Reports submitted by marketplace participants regarding copyright, PII leaks, or corrupted weights
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          {["ALL", "PENDING", "IN_REVIEW", "RESOLVED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === st
                  ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 font-mono text-xs text-slate-500">
            No moderation reports found for status "{filterStatus}".
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report._id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(report.priority)}`}>
                    {report.priority} PRIORITY
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadge(report.status)} font-mono`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Reported {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Quick Status Action Buttons */}
                <div className="flex items-center gap-2">
                  {report.status !== "IN_REVIEW" && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onUpdateStatus(report._id, { status: "IN_REVIEW" })}
                    >
                      Mark In Review
                    </Button>
                  )}
                  {report.status !== "RESOLVED" && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => onUpdateStatus(report._id, { status: "RESOLVED" })}
                    >
                      Resolve
                    </Button>
                  )}
                  {report.status !== "DISMISSED" && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => onUpdateStatus(report._id, { status: "DISMISSED" })}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Target Asset:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[10px]">
                    {report.targetType}
                  </span>
                  <span className="font-bold text-white">{report.targetTitle}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  <span className="text-slate-500">Reason: </span>
                  <span className="text-rose-300 font-semibold">{report.reason}</span>
                </div>
                <p className="text-xs text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed font-mono">
                  "{report.description}"
                </p>
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Reporter: {report.reporterAddress}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
