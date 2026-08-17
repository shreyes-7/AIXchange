import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DatasetMarketplace from "./pages/DatasetMarketplace";
import DatasetDetails from "./pages/DatasetDetails";
import RegisterDataset from "./pages/RegisterDataset";
import WalletTest from "./pages/WalletTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DatasetMarketplace />} />
        <Route path="/datasets" element={<DatasetMarketplace />} />
        <Route path="/datasets/register" element={<RegisterDataset />} />
        <Route path="/datasets/:id" element={<DatasetDetails />} />
        <Route path="/wallet-test" element={<WalletTest />} />
        <Route path="*" element={<Navigate to="/datasets" replace />} />
      </Routes>
    </Router>
  );
}

export default App;