import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { poApi } from "../api/poApi";
import type { PurchaseOrder } from "../api/mockDb";

export default function PoList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    poApi.list().then(setRows);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>발주(PO) 목록</h2>
        <button onClick={() => nav("/po/new")}>발주 등록</button>
      </div>

      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>PO</th>
            <th>Vendor</th>
            <th>Purchased At</th>
            <th>Requested By</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr
              key={p.po_id}
              style={{ borderBottom: "1px solid #333", cursor: "pointer" }}
              onClick={() => nav(`/po/${p.po_id}`)}
            >
              <td>{p.po_number ?? `PO-${p.po_id}`}</td>
              <td>{p.vendor_name ?? "-"}</td>
              <td>{p.purchased_at}</td>
              <td>{p.requested_by.display_name}</td>
              <td>{p.purchase_reason}</td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                발주가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
