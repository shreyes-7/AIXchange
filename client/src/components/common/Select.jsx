import React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  disabled = false,
  error = "",
  helperText = "",
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 font-mono ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl bg-slate-950/80 border text-xs text-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-9 py-2.5 ${
            error
              ? "border-rose-500/80 focus:border-rose-500"
              : "border-slate-800 hover:border-slate-700 focus:border-cyan-500"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-900" : "cursor-pointer"}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-950 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === "object" ? opt.value : opt;
            const lbl = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-slate-950 text-slate-100">
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-[11px] text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
