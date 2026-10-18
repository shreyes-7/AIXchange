import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UserPlus, User, Key, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import PublicShell from "../layouts/PublicShell";
import { Button, Input, Badge } from "../components/common";
import { registerUser } from "../services/api/authApi.service";
import { loginSuccess } from "../store/slices/authSlice";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("consumer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ name: name.trim(), email: email.trim(), password });
      if (res?.success && res.data) {
        if (res.data.accessToken) {
          dispatch(
            loginSuccess({
              user: res.data.user,
              token: res.data.accessToken,
              role: res.data.user?.role || role,
            })
          );
        }
        navigate("/datasets");
      } else {
        setError(res?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to register. Please check your inputs.";
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
              <UserPlus className="w-6 h-6" />
            </div>

            <Badge variant="brand" size="xs" pulse className="mb-2">
              Join the AI Substrate
            </Badge>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Publish datasets, train verifiable models, and receive automated on-chain royalties.
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
              label="Full Name / Handle"
              type="text"
              icon={User}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Shreyes Jaiswal"
              autoComplete="name"
            />

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
              label="Password (min 8 characters)"
              type="password"
              icon={Key}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Key}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />

            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Primary Role Intent
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole("consumer")}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    role === "consumer"
                      ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Consumer (Buyer)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    role === "creator"
                      ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Creator (Developer)
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                *Creators inherit all Consumer capabilities (buy, download, train).
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              iconRight={ArrowRight}
              className="w-full mt-2 font-bold tracking-wide"
            >
              Register on Substrate
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
