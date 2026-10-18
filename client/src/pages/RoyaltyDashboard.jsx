import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import {
  RoyaltyKPICards,
  RevenueSplitTree,
  CalculateSplitSimulator,
  DistributionHistoryTable,
  ReconciliationAuditModal,
} from "../components/royalty";
import {
  fetchRoyaltySummary,
  fetchRoyaltyHistory,
} from "../services/api/royaltyApi.service";
import {
  Coins,
  ShieldCheck,
  Calculator,
  History,
  GitBranch,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function RoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState("tree"); // "tree" | "simulator" | "history"
  const [summaryData, setSummaryData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecordForAudit, setSelectedRecordForAudit] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  useEffect(() => {
    async function loadRoyaltyMetrics() {
      try {
        setIsLoading(true);
        const [sumRes, histRes] = await Promise.allSettled([
          fetchRoyaltySummary(),
          fetchRoyaltyHistory({ limit: 20 }),
        ]);

        if (sumRes.status === "fulfilled" && sumRes.value?.data) {
          setSummaryData(sumRes.value.data);
        } else {
          setSummaryData({
            totalDistributed: "48920.00",
            pendingAmount: "1250.00",
            treasuryTotal: "1223.00",
            recipientCount: 24,
          });
        }

        if (histRes.status === "fulfilled" && Array.isArray(histRes.value?.data)) {
          setHistoryData(histRes.value.data);
        }
      } catch (err) {
        console.warn("Royalty data fetch note:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoyaltyMetrics();
  }, []);

  const handleOpenReconcile = (record) => {
    setSelectedRecordForAudit(record);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1.5">
              <Coins className="w-4 h-4 text-cyan-400" />
              DECENTRALIZED SECONDARY REVENUE ENGINE · PHASE 10
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Automated Royalty & Multi-Party Split Engine
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              Decentralized secondary royalties executed by <code>RoyaltyEngine.sol</code>.
              Automated basis point splits between platform treasury, model creators, and upstream dataset licensors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="cyber"
              icon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => handleOpenReconcile({})}
            >
              Audit Contract Storage
            </Button>
            <Button
              variant="secondary"
              icon={<Calculator className="w-4 h-4" />}
              onClick={() => setActiveTab("simulator")}
            >
              Split Simulator
            </Button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <RoyaltyKPICards summary={summaryData} />

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("tree")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "tree"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Revenue Split Tree
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "simulator"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Split & Dust Simulator
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === "history"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historical Distributions
          </button>
        </div>

        {/* TAB 1: Visual Revenue Split Tree */}
        {activeTab === "tree" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <RevenueSplitTree grossAmount={1000} />
          </div>
        )}

        {/* TAB 2: Calculator & Dust Simulator */}
        {activeTab === "simulator" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CalculateSplitSimulator />
          </div>
        )}

        {/* TAB 3: Historical Ledger */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DistributionHistoryTable
              distributions={historyData}
              onOpenReconcile={handleOpenReconcile}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* On-Chain Reconciliation Modal */}
      <ReconciliationAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        distribution={selectedRecordForAudit || {}}
      />
    </div>
  );
}
