import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { poApi } from "../api/poApi";
import { mockDb } from "../api/mockDb";
import type { Asset, PurchaseOrder, PurchaseOrderLine } from "../api/mockDb";

const ME_USER_ID = 1; // 임시: 로그인 붙이면 교체

export default function PoDetail() {
  const { poId } = useParams();
  const nav = useNavigate();
  const id = Number(poId);

  const locations = useMemo(() => mockDb.locations, []);

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  const [qtyReceived, setQtyReceived] = useState<number>(1);
  const [locId, setLocId] = useState<number>(2);
  const [refDoc, setRefDoc] = useState<string>("RCPT-NEW");

  const [created, setCreated] = useState<Asset[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    const p = await poApi.get(id);
    setPo(p);
    const ls = await poApi.lines(id);
    setLines(ls);
    setSelectedLineId(null);
    setCreated([]);
    setErr(null);
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!po) {
    return (
      <div style={{ padding: 16 }}>
        <h2>PO 상세</h2>
        <div>PO를 찾을 수 없습니다.</div>
        <button onClick={() => nav("/po")}>목록</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>PO 상세</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("/po")}>목록</button>
          <button onClick={() => reload()}>새로고침</button>
        </div>
      </div>

      {err && <div style={{ background: "#3b1b1b", padding: 10, borderRadius: 8, margin: "10px 0" }}>{err}</div>}

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <div><b>PO:</b> {po.po_number ?? `PO-${po.po_id}`}</div>
        <div><b>Vendor:</b> {po.vendor_name ?? "-"}</div>
        <div><b>Purchased At(언제):</b> {po.purchased_at}</div>
        <div><b>Requested By(누가):</b> {po.requested_by.display_name}</div>
        <div><b>Reason(왜):</b> {po.purchase_reason}</div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>라인 선택</h3>

        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
              <th></th>
              <th>Category</th>
              <th>Model</th>
              <th>Description</th>
              <th>Qty Ordered</th>
              <th>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(l => (
              <tr key={l.po_line_id} style={{ borderBottom: "1px solid #333" }}>
                <td>
                  <input
                    type="radio"
                    name="line"
                    checked={selectedLineId === l.po_line_id}
                    onChange={() => setSelectedLineId(l.po_line_id)}
                  />
                </td>
                <td>{l.item_category}</td>
                <td>{l.model_name ?? "-"}</td>
                <td>{l.description ?? "-"}</td>
                <td>{l.qty_ordered}</td>
                <td>{l.unit_price ?? "-"}</td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.7 }}>
                  라인이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "160px 200px 1fr 160px", gap: 10, alignItems: "end" }}>
          <div>
            <label>입고 수량</label>
            <input
              type="number"
              min={1}
              value={qtyReceived}
              onChange={e => setQtyReceived(Number(e.target.value))}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label>입고 위치</label>
            <select value={locId} onChange={e => setLocId(Number(e.target.value))} style={{ width: "100%", padding: 8 }}>
              {locations.map(l => (
                <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Reference Doc(선택)</label>
            <input value={refDoc} onChange={e => setRefDoc(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>

          <button
            disabled={!selectedLineId}
            onClick={async () => {
              try {
                setErr(null);
                if (!selectedLineId) {
                  setErr("입고할 라인을 선택하세요.");
                  return;
                }
                if (!Number.isFinite(qtyReceived) || qtyReceived <= 0) {
                  setErr("입고 수량은 1 이상이어야 합니다.");
                  return;
                }

                const createdAssets = await mockDb.receiveFromPoLine(
                  selectedLineId,
                  qtyReceived,
                  locId,
                  ME_USER_ID,
                  refDoc?.trim() ? refDoc.trim() : undefined
                );
                setCreated(createdAssets);
              } catch (e: any) {
                setErr(e?.message ?? "입고 실패");
              }
            }}
          >
            입고 처리(자산 생성)
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>생성된 자산</h3>
        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
              <th>Asset Tag</th>
              <th>Status</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {created.map(a => (
              <tr key={a.asset_id} style={{ borderBottom: "1px solid #333" }}>
                <td>{a.asset_tag}</td>
                <td>{a.current_status}</td>
                <td>{a.current_location?.location_name ?? "-"}</td>
                <td>
                  <button onClick={() => nav(`/assets/${a.asset_id}`)}>자산 상세</button>
                </td>
              </tr>
            ))}
            {created.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, opacity: 0.7 }}>
                  아직 생성된 자산이 없습니다. 라인을 선택하고 입고 처리하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
