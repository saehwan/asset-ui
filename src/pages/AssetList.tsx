import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetApi } from "../api/assetApi";
import type { Asset, AssetStatus } from "../api/mockDb";
import { StatusBadge } from "../components/StatusBadge";

export default function AssetList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Asset[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AssetStatus | "ALL">("ALL");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    assetApi
      .list()
      .then(setRows)
      .catch((e: any) => setErr(e?.message ?? "자산 목록 조회 실패"));
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter(r => {
      const hitQ =
        !qq ||
        r.asset_tag.toLowerCase().includes(qq) ||
        (r.serial_number ?? "").toLowerCase().includes(qq) ||
        (r.current_owner?.display_name ?? "").toLowerCase().includes(qq) ||
        (r.current_location?.location_name ?? "").toLowerCase().includes(qq);

      const hitS = status === "ALL" ? true : r.current_status === status;
      return hitQ && hitS;
    });
  }, [rows, q, status]);

  return (
    <div style={{ padding: 16 }}>
      <h2>자산 목록</h2>

      {err && <div style={{ background: "#3b1b1b", padding: 10, borderRadius: 8, margin: "10px 0" }}>{err}</div>}

      <div style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="태그/시리얼/소유자/위치 검색"
          style={{ padding: 8, minWidth: 320 }}
        />
        <select value={status} onChange={e => setStatus(e.target.value as any)} style={{ padding: 8 }}>
          <option value="ALL">전체</option>
          <option value="PO_CREATED">발주</option>
          <option value="RECEIVED">입고</option>
          <option value="ISSUED">지급</option>
          <option value="RETURNED">회수</option>
          <option value="DISPOSED">폐기</option>
        </select>
      </div>

      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th>자산태그</th>
            <th>상태</th>
            <th>소유자</th>
            <th>위치</th>
            <th>취득일</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr
              key={r.asset_id}
              style={{ borderBottom: "1px solid #333", cursor: "pointer" }}
              onClick={() => nav(`/assets/${r.asset_id}`)}
            >
              <td>{r.asset_tag}</td>
              <td>
                <StatusBadge status={r.current_status} />
              </td>
              <td>{r.current_owner?.display_name ?? "-"}</td>
              <td>{r.current_location?.location_name ?? "-"}</td>
              <td>{r.acquisition_date ?? "-"}</td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
