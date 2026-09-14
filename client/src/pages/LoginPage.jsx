import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogIn, Key, Mail, Shield, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { loginUser, requestWalletNonce, verifyWalletSignature } from "../services/api/authApi.service";
import { getCurrentAccount, getSigner } from "../services/blockchain/wallet/metamask.service";
import { loginSuccess } from "../store/slices/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletLinking, setWalletLinking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res?.success && res.data) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.accessToken }));
        navigate("/datasets");
      } else {
        setError(res?.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setError("");
    setWalletLinking(true);
    try {
      const address = await getCurrentAccount();
      if (!address) {
        throw new Error("Please connect your MetaMask wallet first.");
      }

      const nonceRes = await requestWalletNonce({ address, chainId: 31337 });
      if (!nonceRes?.success || !nonceRes?.data?.nonce) {
        throw new Error(nonceRes?.message || "Failed to generate wallet verification nonce.");
      }

      const signer = await getSigner();
      const message = `Sign this message to authenticate with AIXchange: ${nonceRes.data.nonce}`;
      const signature = await signer.signMessage(message);

      const verifyRes = await verifyWalletSignature({ address, signature, chainId: 31337 });
      if (verifyRes?.success && verifyRes.data) {
        dispatch(loginSuccess({ user: verifyRes.data.user, token: verifyRes.data.accessToken }));
        navigate("/datasets");
      } else {
        throw new Error(verifyRes?.message || "Wallet signature verification failed.");
      }
    } catch (err) {
      setError(err.message || "Wallet authentication failed.");
    } finally {
      setWalletLinking(false);
    }
  };

  return (
    <PublicShell>
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <LogIn className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Decentralized Substrate Access
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Sign In to AIXchange</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your cryptographic assets, training sandboxes, and royalty streams.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@aixchange.network"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In with Credentials"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-slate-900 text-[10px] font-mono uppercase text-slate-500">
            Or Web3 Authentication
          </span>
        </div>

        <button
          type="button"
          onClick={handleWalletLogin}
          disabled={walletLinking}
          className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:bg-slate-900"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          {walletLinking ? "Signing Nonce..." : "Sign In with EIP-191 Nonce"}
        </button>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
