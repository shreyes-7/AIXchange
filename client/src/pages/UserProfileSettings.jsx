import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button, Input, Badge, Tabs } from "../components/common";
import { AddressBadge, NetworkBadge } from "../components/web3";
import {
  User,
  Shield,
  Wallet,
  Key,
  Bell,
  LogOut,
  CheckCircle2,
  Lock,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";

export default function UserProfileSettings() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const { address, isConnected, chainId, aixBalance } = useSelector(
    (state) => state.wallet
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [displayName, setDisplayName] = useState(user?.name || "AI Researcher");
  const [email, setEmail] = useState(user?.email || "researcher@aixchange.io");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "wallet", label: "Linked Web3 Wallets", icon: Wallet },
    { id: "security", label: "Security & Sessions", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-xl font-mono">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase font-semibold">
                  {role || "Consumer"}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-xs mt-0.5">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {address && <AddressBadge address={address} />}
            <NetworkBadge chainId={chainId || 31337} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Profile & Identity */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Public Profile Credentials</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage your marketplace identity and creator attribution info
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <Input
                label="Display Name / Organization"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input
                label="Contact Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile parameters successfully synchronized.</span>
                </div>
              )}

              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </form>
          </div>
        )}

        {/* Tab 2: Linked Web3 Wallets */}
        {activeTab === "wallet" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6 font-mono text-xs">
            <div>
              <h2 className="text-lg font-bold text-white">Cryptographic Wallet Binding</h2>
              <p className="text-slate-400 mt-0.5">
                EIP-191 signed authentication linking Ethereum accounts to your profile
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Primary Linked Address:</span>
                {address ? (
                  <AddressBadge address={address} truncate={false} />
                ) : (
                  <span className="text-amber-400">No Web3 wallet connected</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">AIX Token Balance:</span>
                <span className="font-bold text-cyan-400 text-sm">{aixBalance || "0.00"} AIX</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Sessions */}
        {activeTab === "security" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6 font-mono text-xs">
            <div>
              <h2 className="text-lg font-bold text-white">Security & Active Sessions</h2>
              <p className="text-slate-400 mt-0.5">
                Revoke JWT authentication tokens and review active authorization grants
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Current Browser Session</span>
                  <span className="text-slate-500 text-[11px]">Hardhat Local Dev Session · Port 5173</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  Active Now
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Terminate Active Session:</span>
                <Button
                  variant="danger"
                  size="xs"
                  icon={<LogOut className="w-3.5 h-3.5" />}
                  onClick={() => dispatch(logout())}
                >
                  Sign Out Everywhere
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === "notifications" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6 font-mono text-xs">
            <div>
              <h2 className="text-lg font-bold text-white">Event Telemetry Subscriptions</h2>
              <p className="text-slate-400 mt-0.5">
                Configure browser notification alerts for on-chain purchases, royalty distributions, and training completions
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: "On-Chain License Purchases", desc: "Instant alert when purchase confirmation block is mined" },
                { title: "Secondary Royalty Disbursements", desc: "Notification whenever your upstream models generate earnings" },
                { title: "Sandbox Training Milestones", desc: "Alert when PyTorch epoch completes or container reaches idle timeout" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-slate-500 text-[11px]">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
