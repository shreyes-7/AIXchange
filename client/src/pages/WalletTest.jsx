import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  disconnectWallet,
  getCurrentAccount,
  getProvider,
  getChainId,
  getNetwork,
  onAccountsChanged,
  removeAccountsChangedListener,
  onChainChanged,
  removeChainChangedListener,
  isSupportedNetwork,
  switchNetwork,
  addNetwork,
  signVerificationMessage,
  verifySignatureDetails,
  SUPPORTED_CHAINS,
} from "../services/blockchain/wallet";

const API_BASE_URL = "http://localhost:5000/api/v1";

export default function WalletTest() {
  // ---------------------------------------------------------------------------
  // Dashboard State
  // ---------------------------------------------------------------------------
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Authentication State
  const [jwtToken, setJwtToken] = useState(localStorage.getItem("accessToken") || "");
  const [refreshTokenVal, setRefreshTokenVal] = useState(localStorage.getItem("refreshToken") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("shreyes@example.com");
  const [loginPassword, setLoginPassword] = useState("Password@123");

  // Wallet Auth Flow State
  const [nonceData, setNonceData] = useState({ nonce: "", message: "" });
  const [signature, setSignature] = useState("");
  const [linkedState, setLinkedState] = useState(null);

  // API Tester State
  const [apiResult, setApiResult] = useState({
    endpoint: "None",
    status: null,
    timeMs: null,
    requestPayload: null,
    responsePayload: null,
  });

  // Debugger State
  const [debugMessage, setDebugMessage] = useState("Sign this message to verify wallet ownership on AIXchange.");
  const [debugSig, setDebugSig] = useState("");
  const [debugRecovered, setDebugRecovered] = useState(null);

  // System Feeds
  const [metamaskEvents, setMetamaskEvents] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [latestError, setLatestError] = useState(null);

  // Local Storage State Mirror
  const [storageMirror, setStorageMirror] = useState({});

  // ---------------------------------------------------------------------------
  // Logging & Error Helpers
  // ---------------------------------------------------------------------------
  const addLog = useCallback((type, message, meta = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [
      { timestamp, type, message, meta },
      ...prev.slice(0, 99),
    ]);
  }, []);

  const addEventLog = useCallback((event, payload) => {
    const timestamp = new Date().toLocaleTimeString();
    setMetamaskEvents((prev) => [
      `[${timestamp}] ${event}: ${JSON.stringify(payload)}`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  const handleError = useCallback((title, err, code = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = err?.response?.data?.message || err?.message || String(err);
    const status = code || err?.code || err?.response?.status || "ERROR";
    setLatestError({
      title,
      code: status,
      message,
      timestamp,
      raw: err,
    });
    addLog("ERROR", `[${title}] ${message}`);
  }, [addLog]);

  // ---------------------------------------------------------------------------
  // Storage Refresh
  // ---------------------------------------------------------------------------
  const refreshStorageMirror = useCallback(() => {
    setStorageMirror({
      accessToken: localStorage.getItem("accessToken") || "null",
      refreshToken: localStorage.getItem("refreshToken") || "null",
      walletAddress: account || "null",
      nonce: nonceData.nonce || "null",
      verificationStatus: linkedState?.verified ? "Verified" : "Unverified",
      connectedNetwork: network?.name || "null",
    });
  }, [account, nonceData.nonce, linkedState, network]);

  // ---------------------------------------------------------------------------
  // Wallet & Network Refresh Logic
  // ---------------------------------------------------------------------------
  const refreshWalletState = useCallback(async () => {
    try {
      const activeAccount = await getCurrentAccount();
      setAccount(activeAccount);

      if (activeAccount) {
        const currentChain = await getChainId();
        const currentNet = await getNetwork();
        const supported = await isSupportedNetwork();

        setChainId(currentChain);
        setNetwork(currentNet);
        setIsSupported(supported);

        // ENS Lookup (safely)
        try {
          const provider = getProvider();
          const ens = await provider.lookupAddress(activeAccount);
          setEnsName(ens);
        } catch {
          setEnsName(null);
        }

        addLog("INFO", `Wallet state refreshed: ${activeAccount} (Chain: ${currentChain})`);
      } else {
        setChainId(null);
        setNetwork(null);
        setIsSupported(false);
        setEnsName(null);
      }
    } catch (err) {
      handleError("Refresh Wallet", err);
    }
  }, [addLog, handleError]);

  // Initial Load & Event Subscribers
  useEffect(() => {
    refreshWalletState();
    refreshStorageMirror();

    // MetaMask Live Event Listeners
    const handleAccounts = (accounts) => {
      addEventLog("accountsChanged", accounts);
      setAccount(accounts.length ? accounts[0] : null);
      addLog("EVENT", `Account changed: ${accounts[0] || "Disconnected"}`);
    };

    const handleChain = (newChainId) => {
      addEventLog("chainChanged", newChainId);
      refreshWalletState();
      addLog("EVENT", `Chain changed to ${newChainId}`);
    };

    try {
      onAccountsChanged(handleAccounts);
      onChainChanged(handleChain);
    } catch (err) {
      // Ignore if MetaMask not installed
    }

    return () => {
      try {
        removeAccountsChangedListener(handleAccounts);
        removeChainChangedListener(handleChain);
      } catch (err) {}
    };
  }, [refreshWalletState, refreshStorageMirror, addEventLog, addLog]);

  // ---------------------------------------------------------------------------
  // Card 1 — Wallet Operations
  // ---------------------------------------------------------------------------
  const handleConnect = async () => {
    try {
      addLog("ACTION", "Initiating eth_requestAccounts...");
      const addr = await connectWallet();
      setAccount(addr);
      await refreshWalletState();
      addLog("SUCCESS", `Connected to wallet: ${addr}`);
    } catch (err) {
      handleError("Connect Wallet", err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAccount(null);
    addLog("INFO", "Wallet disconnected from client session.");
  };

  // ---------------------------------------------------------------------------
  // Card 2 — Network Management
  // ---------------------------------------------------------------------------
  const handleSwitchSepolia = async () => {
    try {
      addLog("ACTION", "Switching to Sepolia Testnet...");
      await switchNetwork(SUPPORTED_CHAINS.SEPOLIA);
      await refreshWalletState();
      addLog("SUCCESS", "Switched network to Sepolia.");
    } catch (err) {
      handleError("Switch Network", err);
    }
  };

  const handleAddHardhat = async () => {
    try {
      addLog("ACTION", "Adding Local Hardhat Network...");
      await addNetwork({
        chainHex: "0x7A69",
        name: "Hardhat Local Network",
        currency: "ETH",
        rpcUrls: ["http://127.0.0.1:8545"],
        blockExplorerUrls: [],
      });
      await refreshWalletState();
      addLog("SUCCESS", "Added Hardhat network.");
    } catch (err) {
      handleError("Add Network", err);
    }
  };

  // ---------------------------------------------------------------------------
  // Card 3 & 5 — Backend Wallet API Endpoints
  // ---------------------------------------------------------------------------
  const executeApiCall = async (name, url, method, body = null, requireAuth = true) => {
    const startTime = performance.now();
    const cleanToken = jwtToken.trim().replace(/\\+$/, "");

    if (requireAuth && !cleanToken) {
      alert("JWT Token required. Please log in first.");
      return null;
    }

    addLog("API_REQ", `${method} ${url}`, body);

    try {
      const headers = { "Content-Type": "application/json" };
      if (requireAuth) {
        headers["Authorization"] = `Bearer ${cleanToken}`;
      }

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`${API_BASE_URL}${url}`, options);
      const data = await res.json();
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      setApiResult({
        endpoint: `${method} ${url}`,
        status: `${res.status} ${res.statusText}`,
        timeMs,
        requestPayload: body,
        responsePayload: data,
      });

      if (!res.ok || !data.success) {
        throw new Error(data.message || `HTTP ${res.status} Error`);
      }

      addLog("API_RES", `[${timeMs}ms] ${method} ${url} -> ${res.status}`, data);
      return data;
    } catch (err) {
      handleError(`API Call: ${name}`, err);
      return null;
    }
  };

  const handleGenerateNonce = async () => {
    if (!account) return alert("Connect wallet first.");
    const data = await executeApiCall("Generate Nonce", "/wallet/nonce", "POST", {
      address: account,
      chainId: chainId || 11155111,
    });
    if (data?.data) {
      setNonceData({
        nonce: data.data.nonce,
        message: data.data.message,
      });
      setDebugMessage(data.data.message);
      addLog("SUCCESS", `Nonce generated: ${data.data.nonce}`);
    }
  };

  const handleSignMessage = async () => {
    if (!nonceData.message) return alert("Generate nonce first.");
    try {
      addLog("ACTION", "Prompting MetaMask signature...");
      const signed = await signVerificationMessage(nonceData.message);
      setSignature(signed.signature);
      setDebugSig(signed.signature);
      addLog("SUCCESS", `Message signed cleanly! Signature: ${signed.signature.slice(0, 16)}...`);
    } catch (err) {
      handleError("Sign Message", err);
    }
  };

  const handleVerifyWallet = async () => {
    if (!signature || !account) return alert("Sign message first.");
    const data = await executeApiCall("Verify Wallet", "/wallet/verify", "POST", {
      address: account,
      signature,
    });
    if (data?.data) {
      setLinkedState(data.data.wallet);
      addLog("SUCCESS", `Wallet verified & linked in MongoDB!`);
    }
  };

  const handleUnlinkWallet = async () => {
    const data = await executeApiCall("Unlink Wallet", "/wallet/unlink", "DELETE");
    if (data?.data) {
      setLinkedState(null);
      setNonceData({ nonce: "", message: "" });
      setSignature("");
      addLog("SUCCESS", "Wallet unlinked from database.");
    }
  };

  const handleGetWalletMe = async () => {
    const data = await executeApiCall("Get Wallet Details", "/wallet/me", "GET");
    if (data?.data) {
      setLinkedState(data.data.wallet);
    }
  };

  // ---------------------------------------------------------------------------
  // Card 4 — JWT Auth Actions
  // ---------------------------------------------------------------------------
  const handleLoginTest = async () => {
    const data = await executeApiCall("Login", "/auth/login", "POST", {
      email: loginEmail,
      password: loginPassword,
    }, false);

    if (data?.data) {
      const { accessToken, refreshToken, user } = data.data;
      setJwtToken(accessToken);
      setRefreshTokenVal(refreshToken);
      setCurrentUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      refreshStorageMirror();
      addLog("SUCCESS", `LoggedIn as ${user.email}`);
    }
  };

  const handleGetProfile = async () => {
    const data = await executeApiCall("Get Profile", "/auth/profile", "GET");
    if (data?.data) {
      setCurrentUser(data.data);
    }
  };

  const handleRefreshToken = async () => {
    const data = await executeApiCall("Refresh Token", "/auth/refresh", "POST", {
      refreshToken: refreshTokenVal,
    }, false);

    if (data?.data) {
      setJwtToken(data.data.accessToken);
      localStorage.setItem("accessToken", data.data.accessToken);
      refreshStorageMirror();
      addLog("SUCCESS", "Access Token refreshed!");
    }
  };

  const handleLogout = async () => {
    await executeApiCall("Logout", "/auth/logout", "POST", {
      refreshToken: refreshTokenVal,
    }, false);

    setJwtToken("");
    setRefreshTokenVal("");
    setCurrentUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    refreshStorageMirror();
    addLog("INFO", "User logged out.");
  };

  // ---------------------------------------------------------------------------
  // Card 6 — Signature Debugger (Ethers verifyMessage)
  // ---------------------------------------------------------------------------
  const handleDebugVerify = () => {
    if (!debugMessage || !debugSig) return alert("Provide message and signature.");
    try {
      const recovered = ethers.verifyMessage(debugMessage, debugSig);
      setDebugRecovered(recovered);
      const isMatch = account && recovered.toLowerCase() === account.toLowerCase();
      addLog("DEBUG", `Signature Debug Result: ${isMatch ? "MATCH" : "MISMATCH"} (Recovered: ${recovered})`);
    } catch (err) {
      handleError("Signature Debugger", err);
    }
  };

  // ---------------------------------------------------------------------------
  // Card 8 — Local Storage Inspection
  // ---------------------------------------------------------------------------
  const handleClearStorage = () => {
    localStorage.clear();
    setJwtToken("");
    setRefreshTokenVal("");
    refreshStorageMirror();
    addLog("WARN", "Local Storage cleared.");
  };

  // ---------------------------------------------------------------------------
  // UI Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Banner */}
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-sky-400 tracking-tight">AIXchange</h1>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">
              Developer Dashboard v1.0
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manual Blockchain, Ethers.js Signature & REST API Testing Suite
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className={`px-3 py-1.5 rounded-md border font-semibold ${account ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
            ● {account ? "Wallet Connected" : "Wallet Disconnected"}
          </span>
          <span className={`px-3 py-1.5 rounded-md border font-semibold ${isSupported ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
            Network: {network?.name || "Unknown"}
          </span>
          <span className={`px-3 py-1.5 rounded-md border font-semibold ${jwtToken ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
            JWT: {jwtToken ? "Active" : "Missing"}
          </span>
        </div>
      </header>

      {/* Main Grid: 10 Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* =================================================================== */}
        {/* CARD 1 — Wallet Connection */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 1 — Wallet Connection</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${account ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {account ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="space-y-2.5 text-sm font-mono">
              <div>
                <span className="text-slate-500 block text-xs">Wallet Address:</span>
                <span className="text-sky-300 break-all select-all">{account || "Not Connected"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">ENS Name:</span>
                <span className="text-slate-300">{ensName || "None (N/A)"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-xs">Chain ID:</span>
                  <span className="text-slate-200">{chainId ? `${chainId}` : "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Network Name:</span>
                  <span className="text-slate-200">{network?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button onClick={handleConnect} className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-3 rounded-lg text-sm transition">
              Connect Wallet
            </button>
            <button onClick={handleDisconnect} className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg text-sm font-medium transition">
              Disconnect
            </button>
            <button onClick={refreshWalletState} className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg text-sm font-medium transition">
              🔄
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 2 — Network Information */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 2 — Network Info</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${isSupported ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {isSupported ? "Supported ✅" : "Unsupported ⚠️"}
              </span>
            </div>

            <div className="space-y-2.5 text-sm font-mono">
              <div>
                <span className="text-slate-500 block text-xs">Current Network:</span>
                <span className="text-slate-200">{network?.name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Chain ID (Decimal / Hex):</span>
                <span className="text-slate-300">{chainId ? `${chainId} (${SUPPORTED_CHAINS.SEPOLIA.chainId === chainId ? "0xaa36a7" : "0x7A69"})` : "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">RPC URL:</span>
                <span className="text-slate-400 text-xs break-all">http://127.0.0.1:8545 / Sepolia Provider</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button onClick={handleSwitchSepolia} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-3 rounded-lg text-sm transition">
              Switch to Sepolia (11155111)
            </button>
            <button onClick={handleAddHardhat} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 rounded-lg text-sm transition">
              Add / Switch Hardhat Local (31337)
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 4 — JWT Authentication */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 4 — JWT Auth</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${jwtToken ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {jwtToken ? "Active" : "Missing"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded"
                />
              </div>

              <div className="text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div><span className="text-slate-500">User:</span> <span className="text-slate-300">{currentUser?.email || "Not Logged In"}</span></div>
                <div><span className="text-slate-500">User ID:</span> <span className="text-slate-400 select-all">{currentUser?._id || currentUser?.userId || "N/A"}</span></div>
                <div><span className="text-slate-500">Token Status:</span> <span className="text-emerald-400">{jwtToken ? "Valid Bearer Token" : "None"}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <button onClick={handleLoginTest} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition">
              Login Test
            </button>
            <button onClick={handleGetProfile} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-lg text-xs transition">
              Get Profile
            </button>
            <button onClick={handleRefreshToken} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-lg text-xs transition">
              Refresh Token
            </button>
            <button onClick={handleLogout} className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 font-medium py-2 px-3 rounded-lg text-xs transition">
              Logout
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 3 — Wallet Authentication Flow */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 3 — Wallet Authentication Flow</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${linkedState?.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {linkedState?.verified ? "Verified & Linked ✅" : "Unverified ⏳"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">1. Generated Nonce:</span>
                  <input readOnly value={nonceData.nonce} placeholder="Click 'Generate Nonce'" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-amber-300" />
                </div>
                <div>
                  <span className="text-slate-500 block">2. EIP-191 Signature:</span>
                  <textarea readOnly rows={3} value={signature} placeholder="Click 'Sign Message'" className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-sky-300 break-all" />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">Challenge Message Text:</span>
                  <textarea readOnly rows={4} value={nonceData.message} placeholder="Backend generated message..." className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-slate-300" />
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                  <div><span className="text-slate-500">Linked Address:</span> <span className="text-slate-200">{linkedState?.address || "None"}</span></div>
                  <div><span className="text-slate-500">Linked At:</span> <span className="text-slate-400">{linkedState?.linkedAt || "N/A"}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
            <button onClick={handleGenerateNonce} className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition">
              1. Generate Nonce
            </button>
            <button onClick={handleSignMessage} className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition">
              2. Sign Message
            </button>
            <button onClick={handleVerifyWallet} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition">
              3. Verify Wallet
            </button>
            <button onClick={handleUnlinkWallet} className="bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-medium py-2 px-3 rounded-lg text-xs transition">
              Unlink Wallet
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 8 — Local Storage Inspector */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 8 — Storage Inspector</h2>
              <button onClick={refreshStorageMirror} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">
                🔄 Refresh
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto">
              <div><span className="text-slate-500">accessToken:</span> <span className="text-sky-400">{storageMirror.accessToken?.slice(0, 20)}...</span></div>
              <div><span className="text-slate-500">refreshToken:</span> <span className="text-slate-400">{storageMirror.refreshToken?.slice(0, 20)}...</span></div>
              <div><span className="text-slate-500">walletAddress:</span> <span className="text-amber-400">{storageMirror.walletAddress}</span></div>
              <div><span className="text-slate-500">nonce:</span> <span className="text-slate-400">{storageMirror.nonce}</span></div>
              <div><span className="text-slate-500">status:</span> <span className="text-emerald-400">{storageMirror.verificationStatus}</span></div>
            </div>
          </div>

          <button onClick={handleClearStorage} className="w-full mt-6 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 font-medium py-2 px-3 rounded-lg text-xs transition">
            Clear Local Storage
          </button>
        </div>

        {/* =================================================================== */}
        {/* CARD 5 — API Testing Suite */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 5 — REST API Tester</h2>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">{apiResult.endpoint}</span>
                {apiResult.status && (
                  <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    {apiResult.status} ({apiResult.timeMs}ms)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={handleGetWalletMe} className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 py-1.5 px-3 rounded text-xs font-mono">
                GET /wallet/me
              </button>
              <button onClick={handleGenerateNonce} className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 py-1.5 px-3 rounded text-xs font-mono">
                POST /wallet/nonce
              </button>
              <button onClick={handleVerifyWallet} className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 py-1.5 px-3 rounded text-xs font-mono">
                POST /wallet/verify
              </button>
              <button onClick={handleUnlinkWallet} className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 py-1.5 px-3 rounded text-xs font-mono">
                DELETE /wallet/unlink
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block mb-1">Request Payload:</span>
                <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 h-32 overflow-auto text-slate-300">
                  {JSON.stringify(apiResult.requestPayload, null, 2) || "// No Request Body"}
                </pre>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Response JSON:</span>
                <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 h-32 overflow-auto text-emerald-400">
                  {JSON.stringify(apiResult.responsePayload, null, 2) || "// No Response Yet"}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 6 — Signature Debugger (Ethers verifyMessage) */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 6 — Signature Debugger</h2>
              {debugRecovered && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${account && debugRecovered.toLowerCase() === account.toLowerCase() ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                  {account && debugRecovered.toLowerCase() === account.toLowerCase() ? "MATCH ✅" : "MISMATCH ❌"}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Original Message:</span>
                <input value={debugMessage} onChange={(e) => setDebugMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-slate-200" />
              </div>
              <div>
                <span className="text-slate-500 block">Signature:</span>
                <input value={debugSig} onChange={(e) => setDebugSig(e.target.value)} placeholder="0x..." className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-sky-300" />
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Recovered Address:</span>
                <span className="text-amber-300 break-all">{debugRecovered || "None"}</span>
              </div>
            </div>
          </div>

          <button onClick={handleDebugVerify} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-3 rounded-lg text-xs transition">
            Execute Ethers verifyMessage()
          </button>
        </div>

        {/* =================================================================== */}
        {/* CARD 7 — MetaMask Events Log */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 7 — MetaMask Events</h2>
              <button onClick={() => setMetamaskEvents([])} className="text-xs text-slate-500 hover:text-slate-300">
                Clear
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 h-44 overflow-y-auto font-mono text-xs text-indigo-300 space-y-1">
              {metamaskEvents.length ? metamaskEvents.map((evt, idx) => (
                <div key={idx}>{evt}</div>
              )) : <span className="text-slate-600">// Subscribed to window.ethereum events...</span>}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 10 — Error & Security Panel */}
        {/* =================================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-100">Card 10 — Error & Security Panel</h2>
              {latestError && (
                <span className="bg-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded font-bold">
                  Code: {latestError.code}
                </span>
              )}
            </div>

            {latestError ? (
              <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-lg text-rose-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between font-bold text-rose-300">
                  <span>❌ [{latestError.title}]</span>
                  <span>{latestError.timestamp}</span>
                </div>
                <div>{latestError.message}</div>
              </div>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-lg text-emerald-300 text-xs font-mono">
                ✅ No errors recorded. System functioning cleanly!
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-slate-500">
            <span>Security Policies: EIP-191 Verified</span> • <span>JWT Bearer Protected</span> • <span>5-Min Nonce Expiry</span>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* CARD 9 — Console Logs Terminal (Bottom Panel) */}
      {/* =================================================================== */}
      <footer className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-bold text-slate-200 font-mono ml-2">Card 9 — Terminal Console Feed</h2>
          </div>
          <button onClick={() => setConsoleLogs([])} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-mono">
            Clear Logs
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg h-56 overflow-y-auto font-mono text-xs space-y-1.5 border border-slate-800/80">
          {consoleLogs.length ? consoleLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${log.type === "ERROR" ? "text-rose-400" : log.type === "SUCCESS" ? "text-emerald-400" : log.type === "API_REQ" ? "text-sky-400" : log.type === "API_RES" ? "text-indigo-400" : "text-amber-400"}`}>
                [{log.type}]
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          )) : <span className="text-slate-600">// Operational logs will appear here...</span>}
        </div>
      </footer>
    </div>
  );
}