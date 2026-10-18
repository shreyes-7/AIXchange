import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WalletPage from "./pages/WalletPage";
import MyAssets from "./pages/MyAssets";
import DatasetMarketplace from "./pages/DatasetMarketplace";
import DatasetDetails from "./pages/DatasetDetails";
import RegisterDataset from "./pages/RegisterDataset";
import ModelMarketplace from "./pages/ModelMarketplace";
import ModelDetails from "./pages/ModelDetails";
import RegisterModel from "./pages/RegisterModel";
import SandboxDashboard from "./pages/SandboxDashboard";
import ProvenanceExplorer from "./pages/ProvenanceExplorer";
import LineageGraphView from "./pages/LineageGraphView";
import InferencePlayground from "./pages/InferencePlayground";
import RoyaltyDashboard from "./pages/RoyaltyDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WalletTest from "./pages/WalletTest";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/my-assets" element={<MyAssets />} />
        
        {/* Datasets */}
        <Route path="/datasets" element={<DatasetMarketplace />} />
        <Route path="/datasets/register" element={<RegisterDataset />} />
        <Route path="/datasets/:id" element={<DatasetDetails />} />
        
        {/* Models */}
        <Route path="/models" element={<ModelMarketplace />} />
        <Route path="/models/register" element={<RegisterModel />} />
        <Route path="/models/:id" element={<ModelDetails />} />

        {/* Sandboxes & Compute */}
        <Route path="/sandboxes" element={<SandboxDashboard />} />

        {/* Provenance Lineage DAG */}
        <Route path="/provenance" element={<ProvenanceExplorer />} />
        <Route path="/provenance/graph/:modelId" element={<LineageGraphView />} />

        {/* Real-time Inference Playground */}
        <Route path="/inference" element={<InferencePlayground />} />

        {/* Secondary Royalty Engine */}
        <Route path="/royalties" element={<RoyaltyDashboard />} />

        {/* Analytics & Benchmarks */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />

        {/* Phase 12: Admin & Fraud Oversight */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Dev & Wallet Testbed */}
        <Route path="/wallet-test" element={<WalletTest />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;