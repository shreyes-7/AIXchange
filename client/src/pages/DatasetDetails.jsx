import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getDataset,
  updateDataset,
  setDatasetStatus,
  transferDatasetOwnership,
  getDatasetRegistryAddress,
} from "../services/blockchain/dataset";
import { getCurrentAccount } from "../services/blockchain/wallet";
import { STANDARD_LICENSES } from "../types/dataset.types";

export default function DatasetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Action State
  const [isEditing, setIsEditing] = useState(false);
  const [editCid, setEditCid] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editRoyalty, setEditRoyalty] = useState(500);

  // Ownership Transfer State
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transaction Status
  const [txState, setTxState] = useState(null); // { stage, txHash, message }
  const [isActionPending, setIsActionPending] = useState(false);

  const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY_URL || "https://ipfs.io/ipfs";
  const contractAddress = getDatasetRegistryAddress();

  const loadDatasetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const acc = await getCurrentAccount();
      setCurrentAccount(acc ? acc.toLowerCase() : null);

      const data = await getDataset(id);
      setDataset(data);
      setEditCid(data.cid);
      setEditLicense(data.license);
      setEditRoyalty(data.royalty);
    } catch (err) {
      console.error("Failed to load dataset details:", err);
      setError(err.message || `Dataset #${id} not found on blockchain.`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDatasetData();
  }, [loadDatasetData]);

  const isOwner = dataset && currentAccount && dataset.owner.toLowerCase() === currentAccount;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsActionPending(true);
      setTxState({ stage: "CHECKING_WALLET", message: "Connecting to wallet..." });

      await updateDataset(
        {
          datasetId: dataset.datasetId,
          cid: editCid,
          license: editLicense,
          royalty: editRoyalty,
        },
        (stage, data) => {
          setTxState({
            stage,
            txHash: data?.txHash,
            message:
              stage === "WAITING_FOR_SIGNATURE"
                ? "Please sign the update transaction in your wallet..."
                : stage === "SUBMITTED"
                ? "Transaction submitted! Waiting for block confirmation..."
                : stage === "CONFIRMED"
                ? "Dataset updated successfully on-chain!"
                : stage,
          });
        }
      );

      setIsEditing(false);
      await loadDatasetData();
    } catch (err) {
      console.error("Update failed:", err);
      setTxState({
        stage: "FAILED",
        message: err.message || "Failed to update dataset on-chain.",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsActionPending(true);
      const nextStatus = !dataset.active;
      setTxState({ stage: "CHECKING_WALLET", message: "Connecting to wallet..." });

      await setDatasetStatus(dataset.datasetId, nextStatus, (stage, data) => {
        setTxState({
          stage,
          txHash: data?.txHash,
          message:
            stage === "WAITING_FOR_SIGNATURE"
              ? `Confirm setting status to ${nextStatus ? "Active" : "Inactive"} in wallet...`
              : stage === "SUBMITTED"
              ? "Transaction submitted! Waiting for confirmation..."
              : stage === "CONFIRMED"
              ? `Status changed to ${nextStatus ? "Active" : "Inactive"}!`
              : stage,
        });
      });

      await loadDatasetData();
    } catch (err) {
      console.error("Status toggle failed:", err);
      setTxState({
        stage: "FAILED",
        message: err.message || "Failed to change dataset status.",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    try {
      setIsActionPending(true);
      setTxState({ stage: "CHECKING_WALLET", message: "Connecting to wallet..." });

      await transferDatasetOwnership(
        dataset.datasetId,
        newOwnerAddress.trim(),
        (stage, data) => {
          setTxState({
            stage,
            txHash: data?.txHash,
            message:
              stage === "WAITING_FOR_SIGNATURE"
                ? "Please sign the ownership transfer transaction..."
                : stage === "SUBMITTED"
                ? "Transaction submitted! Confirming on blockchain..."
                : stage === "CONFIRMED"
                ? "Ownership transferred successfully!"
                : stage,
          });
        }
      );

      setShowTransferModal(false);
      setNewOwnerAddress("");
      await loadDatasetData();
    } catch (err) {
      console.error("Ownership transfer failed:", err);
      setTxState({
        stage: "FAILED",
        message: err.message || "Failed to transfer ownership.",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
          <Link to="/datasets" className="hover:text-cyan-400 transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-300">Dataset #{id}</span>
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading on-chain dataset #{id}...</p>
          </div>
        ) : error || !dataset ? (
          <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center my-8">
            <h2 className="text-xl font-bold text-rose-300">Dataset Not Found</h2>
            <p className="text-sm text-rose-400 mt-2">{error}</p>
            <Link
              to="/datasets"
              className="mt-6 inline-block px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              &larr; Back to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                      ID #{dataset.datasetId}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        dataset.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {dataset.active ? "Active on Blockchain" : "Inactive"}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Registered: {dataset.createdAtFormatted}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  AI Training Dataset #{dataset.datasetId}
                </h1>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Cryptographically registered dataset on the AIXchange decentralized registry.
                </p>

                {/* CID Box */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono uppercase tracking-wider text-slate-500">
                      IPFS Content Identifier (CID)
                    </span>
                    <a
                      href={`${ipfsGateway}/${dataset.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Open in Gateway
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p className="font-mono text-xs text-cyan-300 break-all select-all">
                    {dataset.cid}
                  </p>
                </div>
              </div>

              {/* License & Royalty Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-mono uppercase text-slate-500 block mb-1">
                    License Specification
                  </span>
                  <p className="text-lg font-bold text-white">{dataset.license}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Determines commercial and non-commercial model training rights.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-mono uppercase text-slate-500 block mb-1">
                    Creator Royalty Rate
                  </span>
                  <p className="text-lg font-bold text-purple-400">
                    {dataset.royaltyPercentage}{" "}
                    <span className="text-xs text-purple-300 font-mono">
                      ({dataset.royalty} BPS)
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Allocated to creator wallet on downstream dataset interactions.
                  </p>
                </div>
              </div>

              {/* Edit Form (for owner) */}
              {isEditing && isOwner && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">
                      Update Dataset On-Chain Metadata
                    </h3>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        IPFS CID / Hash
                      </label>
                      <input
                        type="text"
                        value={editCid}
                        onChange={(e) => setEditCid(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          License
                        </label>
                        <select
                          value={editLicense}
                          onChange={(e) => setEditLicense(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          {STANDARD_LICENSES.map((lic) => (
                            <option key={lic.value} value={lic.value}>
                              {lic.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">
                          Royalty (BPS: 0 - 10000)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={editRoyalty}
                          onChange={(e) => setEditRoyalty(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[11px] text-purple-400 block mt-1">
                          = {(editRoyalty / 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isActionPending}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                    >
                      {isActionPending ? "Executing Update..." : "Save Changes on Blockchain"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar / Owner Management Column */}
            <div className="space-y-6">
              {/* Ownership & Provenance Card */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono uppercase text-slate-500 block mb-2">
                  Dataset Ownership
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
                  <span className="text-[11px] text-slate-500 font-mono block">Owner Address</span>
                  <p className="text-xs font-mono text-cyan-300 break-all mt-1">{dataset.owner}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-500 font-mono block">Contract Address</span>
                  <p className="text-xs font-mono text-slate-400 break-all mt-1">{contractAddress}</p>
                </div>

                {isOwner && (
                  <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                    You own this dataset
                  </div>
                )}
              </div>

              {/* Owner Management Controls */}
              {isOwner && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 space-y-3">
                  <h3 className="text-sm font-bold text-indigo-300 mb-2">
                    Dataset Owner Controls
                  </h3>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isActionPending}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors text-left flex items-center justify-between"
                  >
                    <span>{isEditing ? "Close Editor" : "Edit Metadata & Royalty"}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    disabled={isActionPending}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors text-left flex items-center justify-between ${
                      dataset.active
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <span>{dataset.active ? "Deactivate Dataset" : "Reactivate Dataset"}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setShowTransferModal(true)}
                    disabled={isActionPending}
                    className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors text-left flex items-center justify-between"
                  >
                    <span>Transfer Ownership</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfer Ownership Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Transfer Ownership</h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter the Ethereum wallet address of the new dataset owner. This action cannot be undone.
              </p>

              <form onSubmit={handleTransferOwnership} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    New Owner Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Toast / Status Bar */}
        {txState && (
          <div
            className={`fixed bottom-6 right-6 max-w-md p-4 rounded-2xl border shadow-2xl z-50 animate-in slide-in-from-bottom-5 ${
              txState.stage === "FAILED"
                ? "bg-rose-950 border-rose-800 text-rose-200"
                : txState.stage === "CONFIRMED"
                ? "bg-emerald-950 border-emerald-800 text-emerald-200"
                : "bg-slate-900 border-cyan-500/50 text-cyan-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold block uppercase tracking-wider text-[10px] mb-1">
                  Status: {txState.stage}
                </span>
                <p className="text-xs">{txState.message}</p>
                {txState.txHash && (
                  <p className="font-mono text-[10px] text-slate-400 mt-1 break-all">
                    Tx: {txState.txHash}
                  </p>
                )}
              </div>
              <button
                onClick={() => setTxState(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
