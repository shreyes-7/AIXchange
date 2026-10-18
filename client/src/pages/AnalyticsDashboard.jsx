import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  fetchAnalyticsOverview,
  fetchBlockchainGasAnalytics,
  fetchRevenueAnalytics,
} from "../services/api/analyticsApi.service";
import {
  AnalyticsDateRangePicker,
  OverviewTab,
  RevenueAnalyticsTab,
  TransactionAnalyticsTab,
  DownloadAnalyticsTab,
  ApiCallAnalyticsTab,
  BlockchainAnalyticsTab,
} from "../components/analytics";
import {
  Activity,
  Layers,
  Coins,
  ArrowRightLeft,
  DownloadCloud,
  Terminal,
  Fuel,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRange, setSelectedRange] = useState("30d");
  const [granularity, setGranularity] = useState("day");
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetchAnalyticsOverview();
        if (res && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.warn("Analytics overview fetch:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedRange, granularity]);

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Metric,Dimension,Value,Unit\n" +
      `2026-10-18T00:00:00Z,GMV,TotalVolume,184950.00,AIX\n` +
      `2026-10-18T00:00:00Z,Inferences,TotalInvocations,845500,Calls\n` +
      `2026-10-18T00:00:00Z,Bandwidth,IPFSEgress,148.4,TB\n` +
      `2026-10-18T00:00:00Z,Latency,p50,42,ms\n` +
      `2026-10-18T00:00:00Z,GasPrice,BaseFee,2.4,Gwei\n` +
      `2026-10-18T00:00:00Z,SettledTxs,Confirmed,14820,Txs\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AIXchange_Analytics_${selectedRange}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: "overview", label: "Platform Overview", icon: Layers },
    { id: "revenue", label: "Revenue & GMV", icon: Coins },
    { id: "transactions", label: "On-Chain Txs", icon: ArrowRightLeft },
    { id: "downloads", label: "IPFS Bandwidth", icon: DownloadCloud },
    { id: "apicalls", label: "Inference SLAs", icon: Terminal },
    { id: "blockchain", label: "EVM Gas & Velocity", icon: Fuel },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>PHASE 11 · MULTI-DIMENSIONAL PROTOCOL BUSINESS INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Telemetry & Analytics Studio
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-normal">
                EVM + AI Substrate
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Cross-dimensional quantitative diagnostics tracking gross marketplace value, decentralized IPFS egress, neural inference latency, on-chain royalty distribution, and EVM gas consumption.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hardhat Chain #31337</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400">Block #1,429</span>
            </div>
          </div>
        </div>

        {/* Global Date Range Picker & CSV Export Bar */}
        <AnalyticsDateRangePicker
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          granularity={granularity}
          onGranularityChange={setGranularity}
          onExportCsv={handleExportCsv}
        />

        {/* Dimension Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/60 font-mono text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all whitespace-nowrap border ${
                  isActive
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-lg shadow-cyan-950/40"
                    : "bg-slate-900/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel Rendering */}
        <div className="transition-all">
          {activeTab === "overview" && <OverviewTab metrics={metrics} />}
          {activeTab === "revenue" && <RevenueAnalyticsTab />}
          {activeTab === "transactions" && <TransactionAnalyticsTab />}
          {activeTab === "downloads" && <DownloadAnalyticsTab />}
          {activeTab === "apicalls" && <ApiCallAnalyticsTab />}
          {activeTab === "blockchain" && <BlockchainAnalyticsTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
