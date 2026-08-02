import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WalletTest from "./pages/WalletTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/wallet-test" element={<WalletTest />} />
        <Route path="/" element={<WalletTest />} />
        <Route path="*" element={<Navigate to="/wallet-test" replace />} />
      </Routes>
    </Router>
  );
}

export default App;