import React from "react";
import { Calendar, Download, RefreshCw } from "lucide-react";
import Button from "../common/Button";

export default function AnalyticsDateRangePicker({
  selectedRange = "30d",
  onRangeChange,
  granularity = "day",
  onGranularityChange,
  onExportCsv,
}) {
  const ranges = [
    { id: "7d", label: "7D" },
    { id: "30d", label: "30D" },
    { id: "90d", label: "90D" },
    { id: "1y", label: "1Y" },
    { id: "all", label: "ALL" },
  ];

  const granularities = [
    { id: "day", label: "Daily" },
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
      {/* Range Selector */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Range:</span>
        </span>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onRangeChange && onRangeChange(r.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedRange === r.id
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Granularity & Export Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Granularity */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          {granularities.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onGranularityChange && onGranularityChange(g.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                granularity === g.id
                  ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* CSV Export Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={onExportCsv}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
}
