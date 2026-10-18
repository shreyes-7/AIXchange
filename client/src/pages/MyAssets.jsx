import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  FolderLock,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Sparkles,
  Database,
  Cpu,
  Receipt,
  FileCheck,
} from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { Button, Badge, Input } from "../components/common";
import EmptyState from "../components/feedback/EmptyState";
import { getCurrentAccount } from "../services/blockchain/wallet/metamask.service";
import { getPurchaseContract } from "../services/blockchain/purchase/purchase.service";
import { getDataset } from "../services/blockchain/dataset";
import { getMyPurchases } from "../services/api/purchaseApi.service";

export default function MyAssets() {
  const navigate = useNavigate();
  const { isConnected, address } = useSelector((state) => state.wallet);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("datasets");
  const [purchasedDatasets, setPurchasedDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const acc = address || (await getCurrentAccount());

      // 1. Try querying backend API for indexed purchases
      let apiPurchases = [];
      try {
        const res = await getMyPurchases();
        if (res?.success && res.data?.purchases) {
          apiPurchases = res.data.purchases;
        }
      } catch (apiErr) {
        console.warn("Backend purchases fetch warning:", apiErr);
      }

      // 2. Query blockchain directly for ground truth
      const onChainAssets = [];
      if (acc) {
        try {
          const purchaseContract = getPurchaseContract();
          const purchaseIds = await purchaseContract.getBuyerPurchases(acc);

          for (const pid of purchaseIds) {
            try {
              const pData = await purchaseContract.getPurchase(pid);
              const datasetId = pData.datasetId.toString();
              const datasetInfo = await getDataset(datasetId);

              onChainAssets.push({
                purchaseId: pid.toString(),
                datasetId,
                title: datasetInfo?.title || `Dataset #${datasetId}`,
                category: datasetInfo?.category || "Machine Learning",
                cid: datasetInfo?.cid || "QmSyntheticOnChainHash",
                amountPaid: ethers.formatUnits(pData.amountPaid, 18),
                licenseId: pData.licenseId.toString(),
                licenseTier: pData.licenseId.toString() === "2" ? "Exclusive" : "Commercial",
                purchasedAt: new Date(Number(pData.purchasedAt) * 1000).toLocaleDateString(),
                active: pData.active,
              });
            } catch (pErr) {
              console.warn(`Error loading purchase #${pid}:`, pErr);
            }
          }
        } catch (chainErr) {
          console.warn("On-chain purchases query warning:", chainErr);
        }
      }

      // Merge and deduplicate by datasetId
      const mergedMap = new Map();
      for (const item of onChainAssets) {
        mergedMap.set(item.datasetId, item);
      }
      for (const item of apiPurchases) {
        const dId = item.datasetId?.toString() || item._id;
        if (!mergedMap.has(dId)) {
          mergedMap.set(dId, {
            purchaseId: item._id,
            datasetId: dId,
            title: item.datasetTitle || `Dataset #${dId}`,
            category: item.category || "Dataset",
            cid: item.cid || "Qm...",
            amountPaid: item.priceAix || "100",
            licenseTier: item.licenseTier || "Commercial",
            purchasedAt: new Date(item.createdAt || Date.now()).toLocaleDateString(),
            active: true,
          });
        }
      }

      setPurchasedDatasets(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Failed to load user assets:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleDownload = async (asset) => {
    try {
      setDownloadingId(asset.datasetId);
      const token = localStorage.getItem("aix_token");
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

      const downloadUrl = `${apiBase}/datasets/${asset.datasetId}/download`;

      // Trigger authenticated download in browser
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        // Fallback: open IPFS gateway preview
        const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY_URL || "https://ipfs.io/ipfs";
        window.open(`${ipfsGateway}/${asset.cid}`, "_blank");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.title.replace(/\s+/g, "_")}_archive.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct download fallback:", err);
      const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY_URL || "https://ipfs.io/ipfs";
      window.open(`${ipfsGateway}/${asset.cid}`, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredDatasets = purchasedDatasets.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PublicShell>
      <div className="max-w-6xl mx-auto my-10 space-y-8 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="web3" size="xs" pulse>
                <FolderLock className="w-3.5 h-3.5" />
                User Entitlement Portfolio
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              My Licensed Assets
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Access your cryptographically verified dataset licenses, download decrypted archives, and launch datasets directly into isolated Docker training sandboxes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={loadAssets}
              icon={RefreshCw}
            >
              {loading ? "Syncing..." : "Sync Assets"}
            </Button>
            <Link to="/datasets">
              <Button variant="primary" size="sm">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("datasets")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "datasets"
                  ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Purchased Datasets ({purchasedDatasets.length})
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "models"
                  ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Models & Weights (0)
            </button>
          </div>

          <div className="w-full sm:w-64">
            <Input
              type="text"
              icon={Search}
              placeholder="Search licensed assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="h-16 w-full bg-slate-950/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : activeTab === "datasets" ? (
          filteredDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((asset) => (
                <div
                  key={asset.purchaseId}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4 transition-all hover:-translate-y-1 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="xs">
                        {asset.category}
                      </Badge>
                      <Badge variant="verified" size="xs" pulse>
                        {asset.licenseTier}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {asset.title}
                    </h3>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400">
                      <div className="flex justify-between">
                        <span>On-Chain ID:</span>
                        <span className="text-slate-200 font-bold">#{asset.datasetId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="text-cyan-300 font-bold">{asset.amountPaid} AIX</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acquired:</span>
                        <span>{asset.purchasedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={downloadingId === asset.datasetId}
                        loading={downloadingId === asset.datasetId}
                        icon={Download}
                        onClick={() => handleDownload(asset)}
                        className="w-full text-xs font-semibold"
                      >
                        Download
                      </Button>
                      <Button
                        variant="cyber"
                        size="sm"
                        icon={Terminal}
                        onClick={() => navigate(`/sandboxes?datasetId=${asset.datasetId}`)}
                        className="w-full text-xs font-semibold"
                      >
                        Sandbox
                      </Button>
                    </div>

                    <Link
                      to={`/datasets/${asset.datasetId}`}
                      className="text-center text-[11px] font-mono text-slate-400 hover:text-cyan-400 block pt-1"
                    >
                      Inspect Dataset Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderLock}
              title="No Licensed Assets Found"
              description="You have not acquired any dataset or model licenses on the substrate yet. Browse verified assets in the marketplace to get started."
              actionLabel="Explore Dataset Catalog"
              onAction={() => navigate("/datasets")}
            />
          )
        ) : (
          <EmptyState
            icon={Cpu}
            title="No Machine Learning Weights"
            description="You have not registered or acquired any pre-trained model weights on ModelRegistry.sol."
            actionLabel="Browse Model Marketplace"
            onAction={() => navigate("/models")}
          />
        )}
      </div>
    </PublicShell>
  );
}
