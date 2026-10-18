import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Trash2,
  Download,
  ArrowDownCircle,
  Play,
  Shield,
} from "lucide-react";
import Badge from "../common/Badge";

export default function StreamingTerminal({
  logs = [],
  trainingPhase = "IDLE",
  onClearLogs,
  height = "h-[440px]",
}) {
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (logs.length === 0) return;
    const blob = new Blob([logs.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `substrate_exec_logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPhaseBadge = (phase) => {
    switch (phase) {
      case "TRAINING":
        return <Badge variant="cyan" pulse size="sm">TRAINING RUNNING</Badge>;
      case "PREPARING":
        return <Badge variant="indigo" pulse size="sm">PREPARING RUNTIME</Badge>;
      case "FINALIZING":
        return <Badge variant="warning" pulse size="sm">EXPORTING WEIGHTS</Badge>;
      case "COMPLETED":
        return <Badge variant="success" size="sm">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">STANDBY</Badge>;
    }
  };

  const formatLogLine = (line) => {
    if (typeof line !== "string") return line;

    // Detect tags or highlighted words
    if (line.includes("[ERROR]")) {
      return <span className="text-rose-400 font-semibold">{line}</span>;
    }
    if (line.includes("[WARN]")) {
      return <span className="text-amber-400">{line}</span>;
    }
    if (line.includes("Loss:") || line.includes("Train Loss:")) {
      return <span className="text-emerald-300">{line}</span>;
    }
    if (line.includes("SHA-256") || line.includes("Weights SHA-256")) {
      return <span className="text-cyan-300 font-bold bg-cyan-950/40 px-1 py-0.5 rounded">{line}</span>;
    }
    if (line.includes("Execution ID") || line.includes("Receipt")) {
      return <span className="text-indigo-300 font-bold">{line}</span>;
    }
    if (line.includes("Air-gapped") || line.includes("zero-trust")) {
      return <span className="text-teal-300">{line}</span>;
    }
    return <span className="text-slate-300">{line}</span>;
  };

  return (
    <div className={`rounded-2xl bg-slate-950 border border-slate-800 flex flex-col overflow-hidden shadow-2xl ${height}`}>
      {/* Titlebar Header */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-3">
        {/* Window dots & process identifier */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
          <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 inline" />
            stdout · python-substrate-worker-01 (Port 8000)
          </span>
        </div>

        {/* Phase status & Actions */}
        <div className="flex items-center gap-2">
          {getPhaseBadge(trainingPhase)}

          {/* Autoscroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              autoScroll
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll PAUSED"}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopy}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 disabled:opacity-30 transition-colors"
            title="Copy stdout logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownload}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 disabled:opacity-30 transition-colors"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 disabled:opacity-30 transition-colors"
              title="Clear terminal buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Body */}
      <div
        ref={terminalEndRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 select-text bg-slate-950/95"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-12">
            <TerminalIcon className="w-8 h-8 text-slate-700" />
            <p className="italic text-center max-w-sm text-xs">
              Substrate worker container initialized in zero-trust isolation.
              <br />
              Click &quot;Start Isolated Training Run&quot; to mount encrypted dataset and stream PyTorch execution.
            </p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="leading-relaxed hover:bg-slate-900/40 px-1 rounded transition-colors flex items-start gap-2">
              <span className="text-slate-600 select-none text-[10px] w-6 text-right shrink-0">
                {i + 1}
              </span>
              <div className="break-all">{formatLogLine(log)}</div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Egress Filter: 100% BLOCKED</span>
        </div>
        <div>
          <span>{logs.length} lines logged</span>
        </div>
      </div>
    </div>
  );
}
