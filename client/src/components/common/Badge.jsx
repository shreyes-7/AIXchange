import React from "react";

/**
 * AIXchange Cyber-Scientific Status Badge
 * Adheres to ARCHITECT_RULES.md semantic color tokens.
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  pulse = false,
  icon: Icon = null,
  className = "",
  ...props
}) {
  const variants = {
    verified:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    success:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    warning:
      "bg-amber-500/10 text-amber-300 border-amber-500/30",
    pending:
      "bg-amber-500/10 text-amber-300 border-amber-500/30",
    danger:
      "bg-rose-500/10 text-rose-300 border-rose-500/30",
    error:
      "bg-rose-500/10 text-rose-300 border-rose-500/30",
    info:
      "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    web3:
      "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-mono",
    brand:
      "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    compute:
      "bg-purple-500/10 text-purple-300 border-purple-500/30",
    neutral:
      "bg-slate-800/80 text-slate-300 border-slate-700/80",
  };

  const pulseColors = {
    verified: "bg-emerald-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    pending: "bg-amber-400",
    danger: "bg-rose-400",
    error: "bg-rose-400",
    info: "bg-cyan-400",
    web3: "bg-cyan-400",
    brand: "bg-indigo-400",
    compute: "bg-purple-400",
    neutral: "bg-slate-400",
  };

  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1 rounded",
    sm: "text-[11px] px-2 py-0.5 gap-1.5 rounded-md",
    md: "text-xs px-2.5 py-1 gap-1.5 rounded-lg",
  };

  return (
    <span
      className={`inline-flex items-center font-medium border shadow-xs select-none ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            pulseColors[variant] || "bg-cyan-400"
          }`}
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
