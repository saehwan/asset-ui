import type { AssetStatus } from "../api/mockDb";

export function StatusBadge({ status }: { status: AssetStatus }) {
  const map: Record<AssetStatus, string> = {
    PO_CREATED: "발주",
    RECEIVED: "입고",
    ISSUED: "지급",
    RETURNED: "회수",
    DISPOSED: "폐기",
  };

  return (
    <span
      style={{
        padding: "2px 8px",
        border: "1px solid #666",
        borderRadius: 12,
        fontSize: 12,
      }}
    >
      {map[status]}
    </span>
  );
}
