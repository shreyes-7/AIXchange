import React from "react";
import { Loader2 } from "lucide-react";

/**
 * AIXchange Cyber-Scientific Button
 * Adheres to ARCHITECT_RULES.md design token specifications.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/25 border border-cyan-400/20",
    secondary:
      "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700 hover:border-slate-600 shadow-sm",
    outline:
      "bg-transparent hover:bg-slate-800/40 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-300",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-500/10",
    success:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/10",
    cyber:
      "bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-sm shadow-cyan-500/10 font-mono",
  };

  const sizes = {
    xs: "text-[11px] px-2.5 py-1 gap-1.5 rounded-lg",
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
    md: "text-xs px-4 py-2.5 gap-2",
    lg: "text-sm px-5 py-3 gap-2.5",
    icon: "p-2 rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : Icon ? (
        React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon className="w-4 h-4 shrink-0 text-current" />
        )
      ) : null}

      {children && <span>{children}</span>}

      {!loading && IconRight ? (
        React.isValidElement(IconRight) ? (
          IconRight
        ) : (
          <IconRight className="w-4 h-4 shrink-0 text-current" />
        )
      ) : null}
    </button>
  );
}
