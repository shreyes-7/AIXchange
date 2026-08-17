import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  // Transaction Lifecycle
  const [txStage, setTxStage] = useState(TRANSACTION_STAGES.IDLE);
  const [txHash, setTxHash] = useState("");
  const [newDatasetId, setNewDatasetId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const royaltyBps = Math.round(parseFloat(royaltyPercentage || "0") * 100);

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
      setErrorMessage("Please provide a valid IPFS CID / dataset hash.");
      return;
    }

    if (royaltyBps < 0 || royaltyBps > 10000) {
      setErrorMessage("Royalty must be between 0% and 100% (0 - 10000 basis points).");
      return;
    }

    try {
      setTxStage(TRANSACTION_STAGES.CHECKING_WALLET);

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

        {!account ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Wallet Connection Required</h2>
            <p className="text-xs text-slate-400 mt-2 mb-6">
              Connect your Web3 wallet (MetaMask) to sign and anchor your dataset ownership on the blockchain.
            </p>
            <button
              onClick={handleConnect}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              Connect MetaMask
            </button>
          </div>
        ) : (
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

                {/* Section 2: Storage & IPFS Reference */}
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">
                      2
                    </span>
                    IPFS Reference / Dataset Hash
                  </h2>

                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                    <strong>Decentralized Storage Architecture:</strong> The smart contract stores verifiable IPFS Content Identifiers (CID) rather than large binary datasets. Encrypted raw files remain hosted off-chain via IPFS/Pinata.
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      IPFS CID / Hash <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco or bafy..."
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
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
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  Sign & Register on Blockchain
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
                      {cid || "Not specified yet"}
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

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 truncate">
                    Owner: {account}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
