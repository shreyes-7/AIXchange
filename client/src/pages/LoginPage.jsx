import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogIn, Key, Mail, Shield, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { Button, Input, Badge } from "../components/common";
import { loginUser } from "../services/api/authApi.service";
import { loginSuccess } from "../store/slices/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isConnected, address } = useSelector((state) => state.wallet);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/datasets";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res?.success && res.data) {
        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.accessToken,
            role: res.data.user?.role || "consumer",
          })
        );
        navigate(from, { replace: true });
      } else {
        setError(res?.message || "Invalid email or password.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to sign in. Please verify your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800/90 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl relative overflow-hidden">
          {/* Cyber Decorative Gradients */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
              <LogIn className="w-6 h-6" />
            </div>
            
            <Badge variant="web3" size="xs" pulse className="mb-2">
              Decentralized Substrate Access
            </Badge>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to AIXchange
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Access your cryptographic assets, training sandboxes, and automated royalty engine.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@aixchange.network"
              autoComplete="email"
              monospace
            />

            <Input
              label="Password"
              type="password"
              icon={Key}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-500 hover:text-slate-400 cursor-not-allowed">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              iconRight={ArrowRight}
              className="w-full mt-2 font-bold tracking-wide"
            >
              Sign In with Credentials
            </Button>
          </form>

          {/* Web3 Linked Status Pill */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-medium">MetaMask Status</span>
              </div>
              {isConnected ? (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Not connected
                </span>
              )}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have a substrate account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
