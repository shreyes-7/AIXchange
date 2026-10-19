import React from "react";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "pills", // "pills" | "underlined"
  className = "",
}) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const badge = tab.badge;

        if (variant === "underlined") {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 transition-all whitespace-nowrap border-b-2 font-medium ${
                isActive
                  ? "border-cyan-400 text-cyan-300 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />}
              <span>{tab.label}</span>
              {badge !== undefined && badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap border ${
              isActive
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-sm shadow-cyan-950/50"
                : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700"
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />}
            <span>{tab.label}</span>
            {badge !== undefined && badge !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
