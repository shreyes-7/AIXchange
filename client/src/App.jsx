import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WalletPage from "./pages/WalletPage";
import DatasetMarketplace from "./pages/DatasetMarketplace";
import DatasetDetails from "./pages/DatasetDetails";
import RegisterDataset from "./pages/RegisterDataset";
import ModelMarketplace from "./pages/ModelMarketplace";
import ModelDetails from "./pages/ModelDetails";
import RegisterModel from "./pages/RegisterModel";
import SandboxDashboard from "./pages/SandboxDashboard";
import ProvenanceExplorer from "./pages/ProvenanceExplorer";
import InferencePlayground from "./pages/InferencePlayground";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
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

        {/* Real-time Inference Playground */}
        <Route path="/inference" element={<InferencePlayground />} />

        {/* Analytics & Benchmarks */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />

        {/* Dev & Wallet Testbed */}
        <Route path="/wallet-test" element={<WalletTest />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;