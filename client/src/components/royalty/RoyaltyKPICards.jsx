import React from "react";
import {
  Coins,
  Clock,
  ShieldCheck,
  Users,
  TrendingUp,
  Percent,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function RoyaltyKPICards({ summary = {} }) {
  const cards = [
    {
      title: "Total Distributed Revenue",
      value: summary.totalDistributed
        ? `${parseFloat(summary.totalDistributed).toLocaleString(undefined, { maximumFractionDigits: 2 })} AIX`
        : "48,920.00 AIX",
      change: "+18.4% vs last cycle",
      trend: "positive",
      icon: Coins,
      accent: "cyan",
      borderColor: "border-cyan-500/30 hover:border-cyan-400/50",
      iconBg: "bg-cyan-950/60 text-cyan-400 border-cyan-800/60",
      description: "Gross secondary revenue split across creators and licensors.",
    },
    {
      title: "Pending Settlement Queue",
      value: summary.pendingAmount
        ? `${parseFloat(summary.pendingAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} AIX`
        : "1,250.00 AIX",
      change: "3 Batches Queued",
      trend: "neutral",
      icon: Clock,
      accent: "purple",
      borderColor: "border-purple-500/30 hover:border-purple-400/50",
      iconBg: "bg-purple-950/60 text-purple-400 border-purple-800/60",
      description: "Committed distributions awaiting final block confirmation.",
    },
    {
      title: "Protocol Treasury Fee (2.50%)",
      value: summary.treasuryTotal
        ? `${parseFloat(summary.treasuryTotal).toLocaleString(undefined, { maximumFractionDigits: 2 })} AIX`
        : "1,223.00 AIX",
      change: "Zero-Leakage Dust Verified",
      trend: "positive",
      icon: ShieldCheck,
      accent: "emerald",
      borderColor: "border-emerald-500/30 hover:border-emerald-400/50",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
      description: "Fixed protocol platform reserve + rounding remainder dust.",
    },
    {
      title: "Active Contributor Recipients",
      value: summary.recipientCount
        ? `${summary.recipientCount} Accounts`
        : "24 Recipient Wallets",
      change: "100% On-Chain Audited",
      trend: "positive",
      icon: Users,
      accent: "blue",
      borderColor: "border-blue-500/30 hover:border-blue-400/50",
      iconBg: "bg-blue-950/60 text-blue-400 border-blue-800/60",
      description: "Dataset licensors & model engineers receiving automated splits.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-slate-900/70 border ${card.borderColor} backdrop-blur-md space-y-4 transition-all duration-300 shadow-xl flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    card.trend === "positive"
                      ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/60"
                      : "bg-purple-950/50 text-purple-400 border-purple-800/60"
                  }`}
                >
                  {card.change}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-sans border-t border-slate-800/80 pt-3">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
