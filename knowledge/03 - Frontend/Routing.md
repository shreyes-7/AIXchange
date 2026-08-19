# Routing

## Overview

Client-side routing in AIXchange is configured using **React Router DOM v7** inside `client/src/App.jsx`.

---

## Route Table

| Path | Component | Description | Access |
| :--- | :--- | :--- | :--- |
| `/` | `DatasetMarketplace` | Marketplace catalog (Default home view) | Public |
| `/datasets` | `DatasetMarketplace` | Dataset catalog, search, and category filters | Public |
| `/datasets/:id` | `DatasetDetails` | On-chain provenance & owner management controls | Public / Owner |
| `/datasets/register` | `RegisterDataset` | Multi-step dataset publishing wizard | Connected Wallet |
| `/wallet-test` | `WalletTest` | Developer diagnostics & Web3 wallet testbed | Public |

---

## Code Implementation (`client/src/App.jsx`)

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DatasetMarketplace from './pages/DatasetMarketplace';
import DatasetDetails from './pages/DatasetDetails';
import RegisterDataset from './pages/RegisterDataset';
import WalletTest from './pages/WalletTest';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DatasetMarketplace />} />
            <Route path="/datasets" element={<DatasetMarketplace />} />
            <Route path="/datasets/:id" element={<DatasetDetails />} />
            <Route path="/datasets/register" element={<RegisterDataset />} />
            <Route path="/wallet-test" element={<WalletTest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```
