import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  fetchTreasuryOverview,
  fetchFraudFlags,
  reviewFraudFlag,
  fetchReports,
  updateReportStatus,
  fetchModerationAudits,
  fetchAdminDatasets,
  updateDatasetStatus,
  fetchAdminModels,
  updateModelStatus,
} from "../services/api/adminApi.service";
import {
  TreasuryOversightCard,
  FraudDetectionTable,
  FraudReviewModal,
  ReportResolutionQueue,
  AssetModerationPanel,
  ModerationAuditTrail,
} from "../components/admin";
import {
  ShieldAlert,
  Vault,
  FileText,
  Sliders,
  FileCode2,
  Lock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("treasury");
  const [treasury, setTreasury] = useState({});
  const [fraudFlags, setFraudFlags] = useState([]);
  const [reports, setReports] = useState([]);
  const [audits, setAudits] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tRes, fRes, rRes, aRes, dRes, mRes] = await Promise.all([
        fetchTreasuryOverview(),
        fetchFraudFlags(),
        fetchReports(),
        fetchModerationAudits(),
        fetchAdminDatasets(),
        fetchAdminModels(),
      ]);

      if (tRes?.data) setTreasury(tRes.data);
      if (fRes?.data?.items) setFraudFlags(fRes.data.items);
      if (rRes?.data?.items) setReports(rRes.data.items);
      if (aRes?.data?.items) setAudits(aRes.data.items);
      if (dRes?.data?.items) setDatasets(dRes.data.items);
      if (mRes?.data?.items) setModels(mRes.data.items);
    } catch (err) {
      console.warn("Admin data load notice:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectFlag = (flag) => {
    setSelectedFlag(flag);
    setIsReviewModalOpen(true);
  };

  const handleReviewFlag = async (id, data) => {
    await reviewFraudFlag(id, data);
    setFraudFlags((prev) =>
      prev.map((f) => (f._id === id || f.flagId === id ? { ...f, status: data.status } : f))
    );
    // Add audit entry
    setAudits((prev) => [
      {
        _id: `aud_${Date.now()}`,
        action: "FLAG_REVIEW",
        targetType: "FRAUD_FLAG",
        targetId: id,
        previousStatus: "PENDING_REVIEW",
        newStatus: data.status,
        reason: data.notes,
        adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleUpdateReport = async (reportId, data) => {
    await updateReportStatus(reportId, data);
    setReports((prev) =>
      prev.map((r) => (r._id === reportId ? { ...r, status: data.status } : r))
    );
  };

  const handleUpdateDataset = async (datasetId, data) => {
    await updateDatasetStatus(datasetId, data);
    setDatasets((prev) =>
      prev.map((d) => (d._id === datasetId ? { ...d, status: data.status } : d))
    );
    setAudits((prev) => [
      {
        _id: `aud_${Date.now()}`,
        action: "STATUS_UPDATE",
        targetType: "DATASET",
        targetId: datasetId,
        previousStatus: data.status === "active" ? "suspended" : "active",
        newStatus: data.status,
        reason: data.reason,
        adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleUpdateModel = async (modelId, data) => {
    await updateModelStatus(modelId, data);
    setModels((prev) =>
      prev.map((m) => (m._id === modelId ? { ...m, status: data.status } : m))
    );
    setAudits((prev) => [
      {
        _id: `aud_${Date.now()}`,
        action: "STATUS_UPDATE",
        targetType: "MODEL",
        targetId: modelId,
        previousStatus: data.status === "active" ? "suspended" : "active",
        newStatus: data.status,
        reason: data.reason,
        adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const pendingFlagsCount = fraudFlags.filter((f) => f.status === "PENDING_REVIEW").length;
  const pendingReportsCount = reports.filter((r) => r.status === "PENDING").length;

  const tabs = [
    { id: "treasury", label: "Authoritative Treasury", icon: Vault },
    {
      id: "fraud",
      label: "Fraud Engine Flags",
      icon: ShieldAlert,
      badge: pendingFlagsCount > 0 ? pendingFlagsCount : null,
    },
    {
      id: "reports",
      label: "Report Resolution Queue",
      icon: FileText,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
    },
    { id: "moderation", label: "Asset Moderation", icon: Sliders },
    { id: "audits", label: "Moderation Audit Trail", icon: FileCode2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>PHASE 12 · DECENTRALIZED OVERSIGHT, FRAUD ENGINE & TREASURY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Admin & Governance Oversight
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono font-normal">
                Multi-Sig Authorized
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Decentralized surveillance monitoring treasury vaults, deterministic anomaly detection, content report resolution, and append-only moderation logging.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sync Substrate</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              Root Authority: 0xf39F...2266
            </div>
          </div>
        </div>

        {/* Oversight Tabs */}
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
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold shadow-lg shadow-rose-950/40"
                    : "bg-slate-900/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-rose-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="transition-all">
          {activeTab === "treasury" && <TreasuryOversightCard treasury={treasury} />}
          {activeTab === "fraud" && (
            <FraudDetectionTable flags={fraudFlags} onSelectFlag={handleSelectFlag} />
          )}
          {activeTab === "reports" && (
            <ReportResolutionQueue reports={reports} onUpdateStatus={handleUpdateReport} />
          )}
          {activeTab === "moderation" && (
            <AssetModerationPanel
              datasets={datasets}
              models={models}
              onUpdateDatasetStatus={handleUpdateDataset}
              onUpdateModelStatus={handleUpdateModel}
            />
          )}
          {activeTab === "audits" && <ModerationAuditTrail audits={audits} />}
        </div>
      </main>

      {/* Fraud Inspection & Review Modal */}
      <FraudReviewModal
        flag={selectedFlag}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReview={handleReviewFlag}
      />

      <Footer />
    </div>
  );
}
