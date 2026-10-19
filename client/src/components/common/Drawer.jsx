import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md", // "max-w-md" | "max-w-lg" | "max-w-2xl"
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${width} transform bg-slate-900 border-l border-slate-800 shadow-2xl transition-all animate-in slide-in-from-right duration-300 flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
