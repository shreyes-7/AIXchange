import React from "react";
import {
  FileCode2,
  ShieldCheck,
  Clock,
  ArrowRight,
  UserCheck,
  Layers,
} from "lucide-react";

export default function ModerationAuditTrail({ audits = [] }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              Append-Only Moderation Audit Log
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Immutable historical record of all administrative interventions, status transitions, and fraud resolutions
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Append-Only Enforced
          </span>
        </div>

        {audits.length === 0 ? (
          <div className="text-center py-12 font-mono text-xs text-slate-500">
            No moderation audit records recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Target Item</th>
                  <th className="pb-3 font-semibold">Transition</th>
                  <th className="pb-3 font-semibold">Audit Rationale</th>
                  <th className="pb-3 font-semibold">Admin Address</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {audits.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                        {a.action}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      <span className="text-slate-400 font-normal mr-1">[{a.targetType}]</span>
                      {a.targetId}
                    </td>
                    <td className="py-3 flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400">{a.previousStatus || "N/A"}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="font-bold text-emerald-400">{a.newStatus}</span>
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3 text-purple-400 truncate max-w-[140px]">
                      {a.adminAddress}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {new Date(a.timestamp).toLocaleString()}
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
