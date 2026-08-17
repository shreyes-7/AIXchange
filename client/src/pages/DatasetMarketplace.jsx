import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllDatasets, getTotalDatasets } from "../services/blockchain/dataset";
import { DATASET_CATEGORIES, STANDARD_LICENSES } from "../types/dataset.types";

export default function DatasetMarketplace() {
  const [datasets, setDatasets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLicense, setSelectedLicense] = useState("All");
  const [previewDataset, setPreviewDataset] = useState(null);

  const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY_URL || "https://ipfs.io/ipfs";

  const loadBlockchainDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const total = await getTotalDatasets();
      setTotalCount(total);
      const list = await getAllDatasets();
      setDatasets(list);
    } catch (err) {
      console.error("Failed to load datasets from blockchain:", err);
      setError(err.message || "Failed to load datasets from smart contract.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainDatasets();
  }, []);

  // Filtered dataset list
  const filteredDatasets = useMemo(() => {
    return datasets.filter((ds) => {
      const matchSearch =
        searchQuery === "" ||
        ds.datasetId.toString().includes(searchQuery) ||
        ds.cid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.license.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLicense =
        selectedLicense === "All" || ds.license === selectedLicense;

      return matchSearch && matchLicense;
    });
  }, [datasets, searchQuery, selectedLicense]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-r from-cyan-500/10 via-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Phase 4 — On-Chain Dataset Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Decentralized AI{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                  Dataset Catalog
                </span>
              </h1>
              <p className="mt-3 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
                Explore verifiable on-chain AI training and evaluation datasets.
                Metadata, licenses, and creator royalties are anchored on the blockchain, with encrypted payloads referenced via IPFS.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/datasets/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register New Dataset
              </Link>
              <button
                onClick={loadBlockchainDatasets}
                disabled={isLoading}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-all"
                title="Refresh datasets from blockchain"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Total On-Chain</span>
              <p className="text-2xl font-extrabold text-white mt-1">{totalCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Active Datasets</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                {datasets.filter((d) => d.active).length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Storage Layer</span>
              <p className="text-2xl font-extrabold text-cyan-400 mt-1">IPFS / Pinata</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Registry State</span>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1">Live Contract</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by ID, CID, Owner, License..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select
              value={selectedLicense}
              onChange={(e) => setSelectedLicense(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Licenses</option>
              {STANDARD_LICENSES.map((lic) => (
                <option key={lic.value} value={lic.value}>
                  {lic.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dataset Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Querying DatasetRegistry contract...</p>
          </div>
        ) : error ? (
          <div className="my-8 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
            <p className="font-semibold">Error Loading Datasets</p>
            <p className="text-sm mt-1 text-rose-400">{error}</p>
            <button
              onClick={loadBlockchainDatasets}
              className="mt-4 px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-200 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800/60 my-8 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">No Datasets Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No datasets matched your search query "${searchQuery}".`
                : "No datasets have been registered on this blockchain network yet."}
            </p>
            <Link
              to="/datasets/register"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-transform hover:scale-105"
            >
              Register the First Dataset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.datasetId}
                className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-cyan-300">
                      ID #{dataset.datasetId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        dataset.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {dataset.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    AI Training Dataset #{dataset.datasetId}
                  </h3>

                  {/* CID display */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>IPFS CID / Hash</span>
                      <a
                        href={`${ipfsGateway}/${dataset.cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        Gateway
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <div className="truncate text-slate-300" title={dataset.cid}>
                      {dataset.cid}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      {dataset.license}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                      {dataset.royaltyPercentage} Royalty
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Owner: {dataset.owner.substring(0, 6)}...{dataset.owner.substring(dataset.owner.length - 4)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDataset(dataset)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      Preview
                    </button>
                    <Link
                      to={`/datasets/${dataset.datasetId}`}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setPreviewDataset(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                Dataset #{previewDataset.datasetId}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {previewDataset.createdAtFormatted}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              On-Chain Reference Preview
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              This record is immutably anchored to the AIXchange DatasetRegistry contract.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block mb-1 font-mono uppercase tracking-wider">Owner Wallet</span>
                <span className="font-mono text-slate-200 break-all">{previewDataset.owner}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block mb-1 font-mono uppercase tracking-wider">IPFS CID</span>
                <span className="font-mono text-cyan-300 break-all">{previewDataset.cid}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1 font-mono uppercase tracking-wider">License</span>
                  <span className="font-semibold text-slate-200">{previewDataset.license}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1 font-mono uppercase tracking-wider">Royalty</span>
                  <span className="font-semibold text-purple-300">{previewDataset.royaltyPercentage} ({previewDataset.royalty} BPS)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <a
                href={`${ipfsGateway}/${previewDataset.cid}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Open IPFS Gateway
              </a>
              <Link
                to={`/datasets/${previewDataset.datasetId}`}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-transform hover:scale-105"
              >
                Full Details Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
