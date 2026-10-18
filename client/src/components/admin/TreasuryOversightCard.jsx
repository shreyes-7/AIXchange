import React from "react";
import {
  Vault,
  Coins,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function TreasuryOversightCard({ treasury }) {
  const safeTreasury = treasury || {};
  const {
    vaultAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
    ethBalance = "14.8500",
    aixBalance = "485,250.00",
    totalInflowsAix = "1,240,000.00",
    totalOutflowsAix = "754,750.00",
    safeErc20Supported = true,
    lastAuditBlock = 1429,
    recentActivity = [],
  } = safeTreasury;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Protocol Vault KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">AIX Vault Holdings</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {aixBalance} <span className="text-sm text-cyan-300">AIX</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SafeERC20 Guarded</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Native ETH Reserves</span>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {ethBalance} <span className="text-sm text-purple-300">ETH</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-sig / Owner Only</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Cumulative Inflows</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {totalInflowsAix} <span className="text-sm text-slate-400">AIX</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Protocol fee & deposits</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Disbursed Outflows</span>
          <div className="text-3xl font-extrabold text-white font-mono">
            {totalOutflowsAix} <span className="text-sm text-slate-400">AIX</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Governance grants & rewards</span>
          </div>
        </div>
      </div>

      {/* Contract Architecture Metadata */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Vault className="w-5 h-5 text-cyan-400" />
              On-Chain Treasury Smart Contract Vault
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Deployed on Hardhat Chain #31337 · Verified safeERC20 depositToken & withdrawal interface
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Audited Contract
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Vault Contract Address:</span>
            <div className="font-bold text-cyan-400 flex items-center gap-1 truncate">
              {vaultAddress}
              <ExternalLink className="w-3 h-3 text-slate-500 cursor-pointer hover:text-cyan-400" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Execution Standard:</span>
            <div className="font-bold text-purple-400">OpenZeppelin SafeERC20 + Ownable</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Last Telemetry Block:</span>
            <div className="font-bold text-emerald-400">Block #{lastAuditBlock}</div>
          </div>
        </div>
      </div>

      {/* Vault Activity Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Recent Treasury Vault Inflows & Outflows
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              On-chain deposits, grant disbursements, and protocol allocations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Event Type</th>
                <th className="pb-3 font-semibold">Token</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Counterparty Address</th>
                <th className="pb-3 font-semibold">Tx Hash</th>
                <th className="pb-3 font-semibold text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentActivity.map((item, idx) => {
                const isInflow = item.type.includes("DEPOSIT");
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold flex items-center gap-2">
                      {isInflow ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3" /> Deposit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> Withdrawal
                        </span>
                      )}
                      <span className="text-slate-300">{item.type}</span>
                    </td>
                    <td className="py-3 font-bold text-cyan-300">{item.token}</td>
                    <td className="py-3 font-bold text-white">{item.amount}</td>
                    <td className="py-3 text-slate-400 truncate max-w-[160px]">
                      {item.from || item.to}
                    </td>
                    <td className="py-3 text-cyan-400 font-mono flex items-center gap-1">
                      {item.txHash}
                      <ExternalLink className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-pointer" />
                    </td>
                    <td className="py-3 text-right text-slate-500">{item.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
