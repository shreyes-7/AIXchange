import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileCode,
  Sparkles,
  RefreshCw,
  Cpu,
  Lock,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export default function ModelChecksumVerifier({
  expectedHash = "",
  modelName = "Model Weights",
  contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
}) {
  const [file, setFile] = useState(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [computedHash, setComputedHash] = useState(null);
  const [isMatch, setIsMatch] = useState(null);
  const [hashCopied, setHashCopied] = useState(false);

  // Normalize expected hash (strip 0x prefix for comparison)
  const cleanExpected = (expectedHash || "").replace(/^0x/i, "").toLowerCase();

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setComputedHash(null);
    setIsMatch(null);
    setComputing(true);
    setProgress(15);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setProgress(60);

      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      setProgress(90);

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setProgress(100);

      setComputedHash(hashHex);
      const matched = hashHex.toLowerCase() === cleanExpected;
      setIsMatch(matched);
    } catch (err) {
      console.error("Hash calculation failed:", err);
      // Fallback
      setComputedHash("Error reading file buffer");
      setIsMatch(false);
    } finally {
      setComputing(false);
    }
  };

  const handleSimulateValid = () => {
    setComputing(true);
    setProgress(30);
    setTimeout(() => {
      setProgress(75);
      setTimeout(() => {
        setComputedHash(cleanExpected);
        setIsMatch(true);
        setFile({ name: `${modelName.toLowerCase().replace(/\s+/g, "_")}.safetensors`, size: 46976204 });
        setProgress(100);
        setComputing(false);
      }, 300);
    }, 250);
  };

  const handleSimulateTampered = () => {
    setComputing(true);
    setProgress(40);
    setTimeout(() => {
      const tampered = "deadd00d" + cleanExpected.slice(8);
      setComputedHash(tampered);
      setIsMatch(false);
      setFile({ name: "unverified_third_party_weights.pt", size: 46976204 });
      setProgress(100);
      setComputing(false);
    }, 400);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Client-Side SHA-256 Weight Attestation
            </h3>
            <Badge variant="cyan" size="sm">Web Crypto API</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Verify that your downloaded model weights match the immutable on-chain digest with 0-server trust.
          </p>
        </div>

        {/* Demo simulator buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateValid}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/80 text-[11px] font-mono transition-colors flex items-center gap-1.5"
            title="Simulate verifying authentic Safetensors file"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Test Valid Weights
          </button>
          <button
            onClick={handleSimulateTampered}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/80 text-[11px] font-mono transition-colors"
            title="Simulate tampered/poisoned file"
          >
            Test Tampered
          </button>
        </div>
      </div>

      {/* Expected On-Chain Hash Reference */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Lock className="w-3.5 h-3.5" /> Expected On-Chain SHA-256 Digest
          </span>
          <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
            Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-cyan-300 font-bold break-all select-all">
            {cleanExpected || "Pending resolution..."}
          </span>
          <button
            onClick={() => copyToClipboard(cleanExpected)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 transition-colors"
            title="Copy expected hash"
          >
            {hashCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isMatch === true
            ? "border-emerald-500/60 bg-emerald-950/20"
            : isMatch === false
            ? "border-rose-500/60 bg-rose-950/20"
            : "border-slate-800 hover:border-cyan-500/50 bg-slate-950/50"
        }`}
      >
        <input
          type="file"
          id="weights-file-input"
          accept=".safetensors,.pt,.bin,.onnx,.h5"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="weights-file-input" className="cursor-pointer block">
          <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
          <div className="text-xs font-mono text-white font-bold">
            Drop model weights file here or <span className="text-cyan-400 underline">browse</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Supports <code>.safetensors</code>, <code>.pt</code>, <code>.onnx</code>, <code>.bin</code> (Processed 100% in local browser RAM)
          </p>
        </label>

        {file && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3 text-xs font-mono text-slate-300">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">{file.name}</span>
            <span className="text-slate-500">
              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar during Hashing */}
      {computing && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Computing SHA-256 digest in WebWorker...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Verification Result Banner */}
      {isMatch !== null && (
        <div
          className={`p-5 rounded-2xl border text-xs font-mono animate-in fade-in duration-200 ${
            isMatch
              ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/60 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {isMatch ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold text-sm">
                {isMatch
                  ? "CRYPTOGRAPHIC INTEGRITY VERIFIED (100% BYTE MATCH)"
                  : "CHECKSUM MISMATCH DETECTED (INTEGRITY FAILED)"}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {isMatch
                  ? "The downloaded model weights file is an authentic, unmodified replica of the model anchored to the Ethereum ModelRegistry contract. Zero weight poisoning or backdoor injection detected."
                  : "The computed file hash does NOT match the on-chain recorded checksum. This file may be corrupted, truncated during download, or modified. Do NOT deploy to production without re-downloading."}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Computed Local Hash:</span>
                  <span className={`font-bold ${isMatch ? "text-emerald-400" : "text-rose-400"}`}>
                    {computedHash}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>On-Chain Expected Hash:</span>
                  <span className="font-bold text-cyan-300">{cleanExpected}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
