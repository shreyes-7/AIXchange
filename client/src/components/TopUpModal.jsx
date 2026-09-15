import React, { useState, useEffect } from "react";
import {
  getPricing,
  createOrder,
  simulateSuccess,
  watchTokenInMetaMask,
} from "../services/api/paymentApi.service";

export default function TopUpModal({ isOpen, onClose, userAccount, onTokensMinted }) {
  const [bundles, setBundles] = useState([
    { id: "starter", name: "Starter", tokens: 5, inr: 250, popular: false },
    { id: "builder", name: "Builder", tokens: 10, inr: 500, popular: true },
    { id: "pro", name: "Pro", tokens: 20, inr: 1000, popular: false },
    { id: "studio", name: "Studio", tokens: 50, inr: 2500, popular: false },
  ]);
  const [selectedTokens, setSelectedTokens] = useState(10);
  const [customTokens, setCustomTokens] = useState("");
  const [tokenPriceInr, setTokenPriceInr] = useState(50);
  const [tokenAddress, setTokenAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState("");
  const [isAddedToWallet, setIsAddedToWallet] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPricing()
        .then((data) => {
          if (data.bundles) setBundles(data.bundles);
          if (data.tokenPriceInr) setTokenPriceInr(data.tokenPriceInr);
          if (data.tokenAddress) setTokenAddress(data.tokenAddress);
        })
        .catch((err) => console.warn("Pricing fetch error:", err.message));
    } else {
      setOrderResult(null);
      setError("");
      setIsAddedToWallet(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTokens = customTokens ? parseInt(customTokens, 10) || 0 : selectedTokens;
  const currentInr = currentTokens * tokenPriceInr;

  const handleSelectBundle = (tokens) => {
    setSelectedTokens(tokens);
    setCustomTokens("");
    setError("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setCustomTokens(val);
    if (val) setSelectedTokens(null);
  };

  const handleCheckout = async () => {
    if (!userAccount) {
      setError("Please connect your MetaMask wallet first.");
      return;
    }

    if (currentTokens < 1) {
      setError("Minimum top-up is 1 AIX.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Step 1: Create Order
      const order = await createOrder({ tokenAmount: currentTokens });

      // Step 2: Simulate Payment Success (Sandbox Mode)
      const completion = await simulateSuccess({ orderId: order.orderId });

      setOrderResult({
        tokens: currentTokens,
        inr: currentInr,
        mintTxHash: completion.mintTxHash,
        tokenAddress: completion.tokenAddress || tokenAddress,
      });

      if (onTokensMinted) {
        onTokensMinted();
      }
    } catch (err) {
      setError(err.message || "Top-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToMetaMask = async () => {
    try {
      await watchTokenInMetaMask({
        tokenAddress: orderResult?.tokenAddress || tokenAddress,
        symbol: "AIX",
        decimals: 18,
      });
      setIsAddedToWallet(true);
    } catch (err) {
      console.error("Watch asset failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl shadow-cyan-950/30">
        
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm border border-cyan-500/30">
                AIX
              </span>
              Top Up Platform Tokens
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fixed rate: <span className="text-cyan-400 font-semibold font-mono">1 AIX = ₹{tokenPriceInr}</span> · Non-fluctuating platform currency
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Sandbox Info Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-start gap-3 text-xs text-cyan-200">
            <span className="text-base leading-none">🛡️</span>
            <div>
              <p className="font-semibold text-cyan-300">Sandbox Test Mode Active</p>
              <p className="text-slate-400 mt-0.5">
                Zero real money charged. Simulates UPI/Card payment and mints real test AIX tokens directly to your MetaMask address.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          {orderResult ? (
            /* Success View */
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Successfully Minted {orderResult.tokens} AIX!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Value: ₹{orderResult.inr} · Tokens are now in your MetaMask wallet
                </p>
                {orderResult.mintTxHash && (
                  <p className="text-[11px] font-mono text-cyan-400 mt-2 truncate max-w-xs mx-auto">
                    Tx: {orderResult.mintTxHash}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  id="btn-add-metamask"
                  onClick={handleAddToMetaMask}
                  disabled={isAddedToWallet}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-cyan-500/50"
                >
                  🦊 {isAddedToWallet ? "Added to MetaMask!" : "Show AIX in MetaMask Assets"}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Done & Return to Marketplace
                </button>
              </div>
            </div>
          ) : (
            /* Selection View */
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2.5">
                  Select a Token Pack
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {bundles.map((bundle) => {
                    const isSelected = selectedTokens === bundle.tokens && !customTokens;
                    return (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => handleSelectBundle(bundle.tokens)}
                        className={`relative p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10"
                            : "bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        {bundle.popular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-sm">
                            Popular
                          </span>
                        )}
                        <div className="flex justify-between items-baseline">
                          <span className="text-base font-extrabold text-white">
                            {bundle.tokens} <span className="text-xs text-cyan-400 font-mono">AIX</span>
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            ₹{bundle.inr}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{bundle.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Or Enter Custom Whole Tokens
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 15"
                    value={customTokens}
                    onChange={handleCustomChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white text-sm placeholder-slate-500 outline-none transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-cyan-400">
                    AIX
                  </span>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-base font-extrabold text-white">
                  ₹{currentInr} <span className="text-xs text-slate-400 font-normal">({currentTokens} AIX)</span>
                </span>
              </div>

              {/* Checkout Button */}
              <button
                id="btn-simulate-checkout"
                onClick={handleCheckout}
                disabled={isLoading || currentTokens < 1}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Simulating Payment & Minting...
                  </>
                ) : (
                  `Pay ₹${currentInr} & Mint to MetaMask`
                )}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
