import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assetApi } from "../api/assetApi";
import { mockDb } from "../api/mockDb";
import type { Asset, AssetEvent } from "../api/mockDb";
import { StatusBadge } from "../components/StatusBadge";

const ME_USER_ID = 1; // 임시: 로그인 붙이면 교체

export default function AssetDetail() {
  const { assetId } = useParams();
  const nav = useNavigate();
  const id = Number(assetId);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [timeline, setTimeline] = useState<AssetEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // 지급
  const [issueTo, setIssueTo] = useState<number>(3);
  const [issueReason, setIssueReason] = useState("");

  // 회수
  const [returnLoc, setReturnLoc] = useState<number>(2);
  const [returnReason, setReturnReason] = useState("");

  // 폐기
  const [disposeReason, setDisposeReason] = useState("");

  async function reload() {
    setErr(null);
    const a = await assetApi.get(id);
    if (!a) {
      setAsset(null);
      setTimeline([]);
      return;
    }
    setAsset(a);
    setTimeline(await assetApi.timeline(id));
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    reload().catch((e: any) => setErr(e?.message ?? "조회 실패"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

    const canIssue =
        asset?.current_status === "RECEIVED" || asset?.current_status === "RETURNED";

    const canReturn = asset?.current_status === "ISSUED";

    const canDispose =
        asset?.current_status === "RECEIVED" || asset?.current_status === "RETURNED";


  if (asset === null) {
    return (
      <div style={{ padding: 16 }}>
        <h2>자산 상세</h2>
        <div>자산을 찾을 수 없습니다.</div>
        <button onClick={() => nav("/assets")} style={{ marginTop: 12 }}>
          목록
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>자산 상세</h2>
        <button onClick={() => nav("/assets")}>목록</button>
      </div>

      {err && <div style={{ background: "#3b1b1b", padding: 10, borderRadius: 8, margin: "10px 0" }}>{err}</div>}

      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <b>자산태그:</b> {asset.asset_tag}
          </div>
          <div>
            <b>상태:</b> <StatusBadge status={asset.current_status} />
          </div>
          <div>
            <b>소유자:</b> {asset.current_owner?.display_name ?? "-"}
          </div>
          <div>
            <b>위치:</b> {asset.current_location?.location_name ?? "-"}
          </div>
          <div>
            <b>취득일:</b> {asset.acquisition_date ?? "-"}
          </div>
        </div>
      </div>

      {/* 액션 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
        {/* 지급 */}
        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, opacity: canIssue ? 1 : 0.45 }}>
          <h3 style={{ marginTop: 0 }}>지급</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label>대상</label>
            <select value={issueTo} onChange={e => setIssueTo(Number(e.target.value))} disabled={!canIssue}>
              {mockDb.users
                .filter(u => u.role === "USER" || u.role === "IT" || u.role === "GA")
                .map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.display_name}
                  </option>
                ))}
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <input
              value={issueReason}
              onChange={e => setIssueReason(e.target.value)}
              placeholder="사유(선택)"
              style={{ width: "100%", padding: 8 }}
              disabled={!canIssue}
            />
          </div>
          <button
            style={{ marginTop: 10 }}
            disabled={!canIssue}
            onClick={async () => {
              try {
                setErr(null);
                await assetApi.issue(id, issueTo, ME_USER_ID, issueReason);
                setIssueReason("");
                await reload();
              } catch (e: any) {
                setErr(e?.message ?? "지급 실패");
              }
            }}
          >
            지급 실행
          </button>
        </div>

        {/* 회수 */}
        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, opacity: canReturn ? 1 : 0.45 }}>
          <h3 style={{ marginTop: 0 }}>회수</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label>회수 위치</label>
            <select value={returnLoc} onChange={e => setReturnLoc(Number(e.target.value))} disabled={!canReturn}>
              {mockDb.locations.map(l => (
                <option key={l.location_id} value={l.location_id}>
                  {l.location_name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <input
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              placeholder="사유(선택)"
              style={{ width: "100%", padding: 8 }}
              disabled={!canReturn}
            />
          </div>
          <button
            style={{ marginTop: 10 }}
            disabled={!canReturn}
            onClick={async () => {
              try {
                setErr(null);
                await assetApi.ret(id, returnLoc, ME_USER_ID, returnReason);
                setReturnReason("");
                await reload();
              } catch (e: any) {
                setErr(e?.message ?? "회수 실패");
              }
            }}
          >
            회수 실행
          </button>
        </div>

        {/* 폐기 */}
        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, opacity: canDispose ? 1 : 0.45 }}>
          <h3 style={{ marginTop: 0 }}>폐기</h3>
          <div>
            <input
              value={disposeReason}
              onChange={e => setDisposeReason(e.target.value)}
              placeholder="폐기사유(필수)"
              style={{ width: "100%", padding: 8 }}
              disabled={!canDispose}
            />
          </div>
          <button
            style={{ marginTop: 10 }}
            disabled={!canDispose}
            onClick={async () => {
              try {
                setErr(null);
                await assetApi.dispose(id, ME_USER_ID, disposeReason);
                setDisposeReason("");
                await reload();
              } catch (e: any) {
                setErr(e?.message ?? "폐기 실패");
              }
            }}
          >
            폐기 실행
          </button>
        </div>
      </div>

      {/* 타임라인 */}
      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>이력(Timeline)</h3>
        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
              <th>시간</th>
              <th>이벤트</th>
              <th>처리자</th>
              <th>사유</th>
              <th>문서</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map(t => (
              <tr key={t.event_id} style={{ borderBottom: "1px solid #333" }}>
                <td>{t.event_time}</td>
                <td>
                  <StatusBadge status={t.to_status} />
                </td>
                <td>{t.performed_by.display_name}</td>
                <td>{t.reason ?? "-"}</td>
                <td>{t.reference_doc ?? "-"}</td>
              </tr>
            ))}
            {timeline.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                  이력이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
