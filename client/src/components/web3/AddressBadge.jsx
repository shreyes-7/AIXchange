import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function AddressBadge({
  address,
  truncate = true,
  copyable = true,
  explorerUrl,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayAddr = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic gradient from address
  const hash = address.slice(2, 8);
  const color1 = `#${hash.slice(0, 6)}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 transition-colors ${className}`}
    >
      {/* Mini Identicon Dot */}
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color1 }}
      />

      <span className="font-semibold text-cyan-300">{displayAddr}</span>

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy Address"}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View on Explorer"
          className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
