import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/**
 * AIXchange Cyber-Scientific Input Field
 * Includes label, prefix/suffix icons, password reveal toggle, error messaging, and monospace formatting.
 */
export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon = null,
  required = false,
  disabled = false,
  monospace = false,
  className = "",
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            {Icon && <Icon className="w-3.5 h-3.5 text-cyan-400" />}
            {label}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-100 placeholder-slate-600 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            monospace ? "font-mono text-xs" : ""
          } ${
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50"
              : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 hover:border-slate-700"
          } ${isPassword ? "pr-10" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-cyan-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-400 font-mono">{helperText}</p>
      ) : null}
    </div>
  );
}
