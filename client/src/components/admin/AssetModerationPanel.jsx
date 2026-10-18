import React, { useState } from "react";
import {
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Shield,
  Search,
} from "lucide-react";
import Button from "../common/Button";

export default function AssetModerationPanel({
  datasets = [],
  models = [],
  onUpdateDatasetStatus,
  onUpdateModelStatus,
}) {
  const [activeSubTab, setActiveSubTab] = useState("datasets");
  const [searchQuery, setSearchQuery] = useState("");

  const items = activeSubTab === "datasets" ? datasets : models;

  const filtered = items.filter((item) => {
    const name = item.title || item.name || "";
    const author = item.author || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const reason = window.prompt(
      `Please provide an administrative reason for changing status to '${newStatus}':`,
      "Routine moderation audit review."
    );
    if (!reason) return;

    if (activeSubTab === "datasets") {
      onUpdateDatasetStatus(id, { status: newStatus, reason });
    } else {
      onUpdateModelStatus(id, { status: newStatus, reason });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-tab & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab("datasets")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border ${
              activeSubTab === "datasets"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Datasets ({datasets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("models")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border ${
              activeSubTab === "models"
                ? "bg-purple-500/10 border-purple-500/40 text-purple-300 font-bold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Models ({models.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Moderation Items Table */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {activeSubTab === "datasets" ? "Dataset Catalog Registry" : "Neural Model Weights Registry"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Enforce state machine transitions: Active ↔ Suspended ↔ Flagged
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Asset Title</th>
                <th className="pb-3 font-semibold">Author</th>
                <th className="pb-3 font-semibold">Classification</th>
                <th className="pb-3 font-semibold">Pricing</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const title = item.title || item.name;
                const classification = item.category || item.task;
                const isSuspended = item.status === "suspended";
                return (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-white flex items-center gap-2">
                      {activeSubTab === "datasets" ? (
                        <Database className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Cpu className="w-4 h-4 text-purple-400" />
                      )}
                      {title}
                    </td>
                    <td className="py-3 text-slate-400">{item.author}</td>
                    <td className="py-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {classification}
                      </span>
                    </td>
                    <td className="py-3 text-cyan-400 font-bold">{item.price}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isSuspended
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant={isSuspended ? "primary" : "secondary"}
                        size="xs"
                        icon={isSuspended ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        onClick={() => handleStatusToggle(item._id, item.status)}
                      >
                        {isSuspended ? "Re-Activate" : "Suspend"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
