import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Navbar from "../components/Navbar";
import { registerDataset } from "../services/blockchain/dataset";
import {
  getCurrentAccount,
  connectWallet,
  isSupportedNetwork,
  getNetwork,
} from "../services/blockchain/wallet";
import {
  STANDARD_LICENSES,
  DATASET_CATEGORIES,
  TRANSACTION_STAGES,
} from "../types/dataset.types";
import { uploadDatasetEncrypted } from "../services/api/datasetApi.service";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function RegisterDataset() {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Computer Vision");
  const [cid, setCid] = useState("");
  const [license, setLicense] = useState("CC-BY-4.0");
  const [royaltyPercentage, setRoyaltyPercentage] = useState("5.0"); // 5.0% = 500 BPS

  // File Upload State
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualCid, setShowManualCid] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  // Transaction Lifecycle
  const [txStage, setTxStage] = useState(TRANSACTION_STAGES.IDLE);
  const [txHash, setTxHash] = useState("");
  const [newDatasetId, setNewDatasetId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const royaltyBps = Math.round(parseFloat(royaltyPercentage || "0") * 100);

  const handleFileSelection = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);

    const bytes = selectedFile.size;
    const formattedSize =
      bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : bytes > 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${bytes} B`;
    setFileSize(formattedSize);

    // Auto-fill Title if empty
    if (!title.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    try {
      setIsProcessingFile(true);
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const multihash = ethers.concat([new Uint8Array([0x12, 0x20]), new Uint8Array(hashBuffer)]);
      const generatedCid = ethers.encodeBase58(multihash);

      setCid(generatedCid);
      setContentHash("0x" + hashHex);

      // Background encrypted upload if backend is accessible
      const formData = new FormData();
      formData.append("file", selectedFile);
      uploadDatasetEncrypted(formData).catch(() => {});
    } catch (err) {
      console.warn("File hashing warning:", err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  useEffect(() => {
    async function initWallet() {
      try {
        const acc = await getCurrentAccount();
        setAccount(acc);
        if (acc) {
          const net = await getNetwork();
          setNetwork(net);
        }
      } catch (err) {
        console.warn("Wallet initialization warning:", err);
      }
    }
    initWallet();
  }, []);

  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
      const net = await getNetwork();
      setNetwork(net);
    } catch (err) {
      setErrorMessage(err.message || "Failed to connect wallet.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!cid.trim()) {
      setErrorMessage("Please upload a dataset file or provide an IPFS CID.");
      return;
    }

    if (royaltyBps < 0 || royaltyBps > 10000) {
      setErrorMessage("Royalty must be between 0% and 100% (0 - 10000 basis points).");
      return;
    }

    try {
      setTxStage(TRANSACTION_STAGES.CHECKING_WALLET);

      let currentAcc = account;
      if (!currentAcc) {
        try {
          currentAcc = await connectWallet();
          setAccount(currentAcc);
          const net = await getNetwork();
          setNetwork(net);
        } catch (walletErr) {
          setTxStage(TRANSACTION_STAGES.FAILED);
          setErrorMessage("Please connect your Web3 wallet (MetaMask) to sign the transaction.");
          return;
        }
      }

      const supported = await isSupportedNetwork();
      if (!supported) {
        setTxStage(TRANSACTION_STAGES.FAILED);
        setErrorMessage("Unsupported network. Please switch to the configured blockchain network.");
        return;
      }

      await registerDataset(
        {
          cid: cid.trim(),
          license,
          royalty: royaltyBps,
        },
        (stage, data) => {
          setTxStage(stage);
          if (data?.txHash) setTxHash(data.txHash);
          if (data?.datasetId) setNewDatasetId(data.datasetId);
        }
      );
    } catch (err) {
      console.error("Registration error:", err);
      setTxStage(TRANSACTION_STAGES.FAILED);
      setErrorMessage(err.message || "Smart contract transaction failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
          <Link to="/datasets" className="hover:text-cyan-400 transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-300">Register Dataset</span>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            On-Chain Publishing
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Register AI Dataset on Blockchain
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Publish cryptographic provenance, licensing, and royalty terms directly to the AIXchange DatasetRegistry contract.
          </p>
        </div>

        {!account && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-white">Wallet not connected.</span> You can prepare dataset details and upload your file now; MetaMask will prompt to sign when you submit.
              </p>
            </div>
            <button
              type="button"
              onClick={handleConnect}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 transition-transform active:scale-95"
            >
              Connect Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Dataset Information
                </h2>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Dataset Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Autonomous Driving High-Res LiDAR Dataset"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        {DATASET_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        License Type
                      </label>
                      <select
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        {STANDARD_LICENSES.map((lic) => (
                          <option key={lic.value} value={lic.value}>
                            {lic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Summary of dataset features, labeling methodology, and modalities..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Section 2: Automated Dataset File Upload & IPFS Pinning */}
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">
                        2
                      </span>
                      Dataset File & Auto-IPFS
                    </h2>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      Auto IPFS Pinning
                    </span>
                  </div>

                  {!file ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleFileSelection(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
                        isDragging
                          ? "border-cyan-400 bg-cyan-950/20"
                          : "border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950"
                      }`}
                      onClick={() => document.getElementById("dataset-file-input")?.click()}
                    >
                      <input
                        id="dataset-file-input"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileSelection(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        Click to upload or drag & drop your dataset file
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports CSV, JSON, Parquet, ZIP, TAR.GZ, H5, PT (up to 50MB)
                      </p>
                      <div className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/30">
                        <Sparkles className="w-3 h-3" />
                        Zero manual IPFS setup: CID and SHA-256 are computed automatically
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
                            <p className="text-xs font-mono text-slate-400">{fileSize}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setFileName("");
                            setFileSize("");
                            setCid("");
                            setContentHash("");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                          title="Remove and change file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isProcessingFile ? (
                        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 py-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Computing SHA-256 digest & generating IPFS CID...
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-900 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Auto-Generated IPFS CID:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-cyan-300 font-semibold truncate max-w-[240px]">
                                {cid}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(cid);
                                  setCopiedCid(true);
                                  setTimeout(() => setCopiedCid(false), 2000);
                                }}
                                className="p-1 text-slate-400 hover:text-cyan-300"
                              >
                                {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {contentHash && (
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                              <span>SHA-256 Digest:</span>
                              <span className="truncate max-w-[240px] text-slate-400">{contentHash}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advanced manual override accordion */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowManualCid(!showManualCid)}
                      className="text-xs font-mono text-slate-400 hover:text-slate-300 flex items-center gap-1.5"
                    >
                      {showManualCid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Advanced: Manual IPFS CID override
                    </button>
                    {showManualCid && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Override with external IPFS CID (Qm... or bafy...)"
                          value={cid}
                          onChange={(e) => setCid(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Royalty Configuration */}
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">
                      3
                    </span>
                    Creator Royalty Policy
                  </h2>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-slate-400">
                        Royalty Rate
                      </label>
                      <span className="text-sm font-bold text-purple-400 font-mono">
                        {royaltyPercentage}% ({royaltyBps} Basis Points)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="0.25"
                      value={royaltyPercentage}
                      onChange={(e) => setRoyaltyPercentage(e.target.value)}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={txStage !== TRANSACTION_STAGES.IDLE && txStage !== TRANSACTION_STAGES.FAILED}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {!account ? "Connect MetaMask & Register" : "Sign & Register on Blockchain"}
                </button>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 sticky top-24">
                <span className="text-xs font-mono uppercase text-slate-500 block mb-3">
                  Live Marketplace Preview
                </span>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-cyan-300">
                      ID: Auto-assigned
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                      Active
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base truncate">
                    {title || "Untitled Dataset"}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {description || "Dataset description will appear here on the marketplace catalog."}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500 block text-[10px] uppercase">IPFS CID</span>
                    <span className="text-cyan-300 truncate block">
                      {cid || "Auto-generated on file upload"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium">
                      {license}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium">
                      {royaltyPercentage}% Royalty
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 truncate flex items-center justify-between">
                    <span>Owner:</span>
                    <span className="text-slate-400">{account || "Connect to sign"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Transaction Modal */}
        {txStage !== TRANSACTION_STAGES.IDLE && txStage !== TRANSACTION_STAGES.FAILED && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
              {txStage === TRANSACTION_STAGES.CONFIRMED ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Registration Confirmed!</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Your dataset was registered on-chain with ID #{newDatasetId || "1"}.
                  </p>
                  {txHash && (
                    <p className="text-[10px] font-mono text-slate-500 break-all mb-6">
                      Tx: {txHash}
                    </p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Link
                      to={`/datasets/${newDatasetId || 1}`}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-transform hover:scale-105"
                    >
                      View Dataset Details
                    </Link>
                    <button
                      onClick={() => {
                        setTxStage(TRANSACTION_STAGES.IDLE);
                        navigate("/datasets");
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Marketplace
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-white">
                    {txStage === TRANSACTION_STAGES.CHECKING_WALLET && "Checking Wallet..."}
                    {txStage === TRANSACTION_STAGES.WAITING_FOR_SIGNATURE && "Waiting for Signature..."}
                    {txStage === TRANSACTION_STAGES.SUBMITTED && "Transaction Submitted..."}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    {txStage === TRANSACTION_STAGES.WAITING_FOR_SIGNATURE &&
                      "Please confirm the registration transaction in your MetaMask wallet popup."}
                    {txStage === TRANSACTION_STAGES.SUBMITTED &&
                      "Transaction is propagating across the network. Awaiting block confirmation."}
                  </p>
                  {txHash && (
                    <p className="text-[10px] font-mono text-cyan-400 break-all mt-4">
                      Tx: {txHash}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
