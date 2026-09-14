import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DatasetMarketplace from "./pages/DatasetMarketplace";
import DatasetDetails from "./pages/DatasetDetails";
import RegisterDataset from "./pages/RegisterDataset";
import WalletTest from "./pages/WalletTest";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/datasets" element={<DatasetMarketplace />} />
        <Route path="/datasets/register" element={<RegisterDataset />} />
        <Route path="/datasets/:id" element={<DatasetDetails />} />
        <Route path="/wallet-test" element={<WalletTest />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;