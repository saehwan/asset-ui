import { Routes, Route, Navigate, Link } from "react-router-dom";
import AssetList from "./pages/AssetList";
import AssetDetail from "./pages/AssetDetail";
import PoList from "./pages/PoList";
import PoNew from "./pages/PoNew";
import PoDetail from "./pages/PoDetail";

export default function App() {
  return (
    <div>
      <div style={{ padding: 12, borderBottom: "1px solid #333", display: "flex", gap: 12 }}>
        <b>Asset Manager</b>
        <Link to="/assets">Assets</Link>
        <Link to="/po">PO</Link>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/assets" replace />} />

        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/:assetId" element={<AssetDetail />} />

        <Route path="/po" element={<PoList />} />
        <Route path="/po/new" element={<PoNew />} />
        <Route path="/po/:poId" element={<PoDetail />} />

        <Route path="*" element={<Navigate to="/assets" replace />} />
      </Routes>
    </div>
  );
}
