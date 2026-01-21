// src/api/mockDb.ts
export type AssetStatus = "PO_CREATED" | "RECEIVED" | "ISSUED" | "RETURNED" | "DISPOSED";
export type Role = "ADMIN" | "GA" | "IT" | "USER" | "AUDIT";

export type User = { user_id: number; display_name: string; role: Role };
export type Location = { location_id: number; location_name: string };

export type PurchaseOrder = {
  po_id: number;
  vendor_name?: string;
  po_number?: string;
  requested_by: User;      // 누가 샀나
  purchased_at: string;    // 언제 샀나 (YYYY-MM-DD)
  purchase_reason: string; // 왜 샀나
  cost_center?: string;
};

export type PurchaseOrderLine = {
  po_line_id: number;
  po_id: number;
  item_category: string;
  model_name?: string;
  description?: string;
  qty_ordered: number;
  unit_price?: number;
};

export type Asset = {
  asset_id: number;
  asset_tag: string; // IT-YYYY-000001
  serial_number?: string;
  current_status: AssetStatus;
  current_owner?: User | null;
  current_location?: Location | null;
  acquisition_date?: string; // 보통 PO purchased_at
  po_line_id?: number | null;
  notes?: string;
};

export type AssetEvent = {
  event_id: number;
  asset_id: number;
  event_type: AssetStatus;
  event_time: string;
  performed_by: User; // 누가 처리했나
  from_status?: AssetStatus | null;
  to_status: AssetStatus;
  reason?: string | null;
  reference_doc?: string | null;
  from_owner_user_id?: number | null;
  to_owner_user_id?: number | null;
  from_location_id?: number | null;
  to_location_id?: number | null;
};

/* -----------------------------
   내부 유틸
----------------------------- */
function nowIso() {
  return new Date().toISOString();
}

function nextId(list: { [k: string]: any }[], key: string) {
  return Math.max(0, ...list.map(x => Number(x[key] ?? 0))) + 1;
}

/* -----------------------------
   마스터 데이터 (Users / Locations)
----------------------------- */
const users: User[] = [
  { user_id: 1, display_name: "Saehwan Park", role: "IT" },
  { user_id: 2, display_name: "정영기", role: "IT" },
  { user_id: 3, display_name: "홍길동", role: "USER" },
  { user_id: 4, display_name: "김지훈", role: "GA" },
];

const locations: Location[] = [
  { location_id: 1, location_name: "IT Room" },
  { location_id: 2, location_name: "Warehouse" },
  { location_id: 3, location_name: "Office" },
];

/* -----------------------------
   PO + Lines 목업 데이터
----------------------------- */
let pos: PurchaseOrder[] = [
  {
    po_id: 1001,
    vendor_name: "CDW",
    po_number: "PO-2026-001",
    requested_by: users[0],
    purchased_at: "2026-01-15",
    purchase_reason: "SAP 인원 증원 장비 구매",
    cost_center: "IT-OPS",
  },
];

let poLines: PurchaseOrderLine[] = [
  {
    po_line_id: 2001,
    po_id: 1001,
    item_category: "Laptop",
    model_name: "Dell Latitude",
    description: "SAP 인원용",
    qty_ordered: 5,
    unit_price: 1200,
  },
  {
    po_line_id: 2002,
    po_id: 1001,
    item_category: "Monitor",
    model_name: "Dell 24",
    description: "업무용",
    qty_ordered: 5,
    unit_price: 180,
  },
];

/* -----------------------------
   Assets + Events 목업 데이터
----------------------------- */
let assets: Asset[] = [
  {
    asset_id: 1,
    asset_tag: "IT-2026-000001",
    current_status: "RECEIVED",
    current_owner: null,
    current_location: locations[1],
    acquisition_date: "2026-01-15",
    po_line_id: 2001,
  },
  {
    asset_id: 2,
    asset_tag: "IT-2026-000002",
    current_status: "ISSUED",
    current_owner: users[2],
    current_location: locations[2],
    acquisition_date: "2026-01-15",
    po_line_id: 2001,
  },
  {
    asset_id: 3,
    asset_tag: "IT-2026-000003",
    current_status: "RETURNED",
    current_owner: null,
    current_location: locations[1],
    acquisition_date: "2026-01-15",
    po_line_id: 2002,
  },
];

let events: AssetEvent[] = [
  {
    event_id: 1,
    asset_id: 2,
    event_type: "ISSUED",
    event_time: "2026-01-16T16:00:00.000Z",
    performed_by: users[0],
    from_status: "RECEIVED",
    to_status: "ISSUED",
    reason: "SAP 인원 지급",
    reference_doc: "ISS-2026-0001",
    from_owner_user_id: null,
    to_owner_user_id: users[2].user_id,
    from_location_id: locations[1].location_id,
    to_location_id: locations[2].location_id,
  },
];

/* -----------------------------
   상태 전이 검증
----------------------------- */
function assertAssetExists(asset_id: number): Asset {
  const a = assets.find(x => x.asset_id === asset_id);
  if (!a) throw new Error("Asset not found");
  return a;
}

function getUser(user_id: number): User {
  const u = users.find(x => x.user_id === user_id);
  if (!u) throw new Error("User not found");
  return u;
}

function getLocation(location_id: number): Location {
  const l = locations.find(x => x.location_id === location_id);
  if (!l) throw new Error("Location not found");
  return l;
}

function pushEvent(e: Omit<AssetEvent, "event_id" | "event_time"> & { event_time?: string }) {
  const event_id = nextId(events as any, "event_id");
  events.unshift({
    event_id,
    event_time: e.event_time ?? nowIso(),
    ...e,
  });
}

/* -----------------------------
   mockDb (외부 공개 API)
----------------------------- */
export const mockDb = {
  // expose read-only masters
  users,
  locations,

  /* -------- Asset 조회 -------- */
  listAssets: async (): Promise<Asset[]> => assets,
  getAsset: async (id: number): Promise<Asset | null> => assets.find(a => a.asset_id === id) ?? null,
  listTimeline: async (asset_id: number): Promise<AssetEvent[]> =>
    events.filter(e => e.asset_id === asset_id).slice().sort((a, b) => (a.event_id ?? 0) - (b.event_id ?? 0)),

  /* -------- Asset 단계 처리 (SP 버튼 대응) -------- */

  // 지급: RECEIVED/RETURNED -> ISSUED
  issueAsset: async (asset_id: number, to_owner_user_id: number, performed_by: number, reason?: string) => {
    const a = assertAssetExists(asset_id);
    if (a.current_status !== "RECEIVED" && a.current_status !== "RETURNED") {
      throw new Error("Asset is not in a state that can be issued");
    }

    const performer = getUser(performed_by);
    const toOwner = getUser(to_owner_user_id);

    const fromStatus = a.current_status;
    const fromOwner = a.current_owner?.user_id ?? null;
    const fromLoc = a.current_location?.location_id ?? null;

    a.current_status = "ISSUED";
    a.current_owner = toOwner;

    pushEvent({
      asset_id,
      event_type: "ISSUED",
      performed_by: performer,
      from_status: fromStatus,
      to_status: "ISSUED",
      reason: reason ?? null,
      reference_doc: null,
      from_owner_user_id: fromOwner,
      to_owner_user_id: toOwner.user_id,
      from_location_id: fromLoc,
      to_location_id: fromLoc,
    });

    return a;
  },

  // 회수: ISSUED -> RETURNED (owner null, location 변경)
  returnAsset: async (asset_id: number, to_location_id: number, performed_by: number, reason?: string) => {
    const a = assertAssetExists(asset_id);
    if (a.current_status !== "ISSUED") {
      throw new Error("Only ISSUED assets can be returned");
    }

    const performer = getUser(performed_by);
    const toLoc = getLocation(to_location_id);

    const fromOwner = a.current_owner?.user_id ?? null;
    const fromLoc = a.current_location?.location_id ?? null;

    a.current_status = "RETURNED";
    a.current_owner = null;
    a.current_location = toLoc;

    pushEvent({
      asset_id,
      event_type: "RETURNED",
      performed_by: performer,
      from_status: "ISSUED",
      to_status: "RETURNED",
      reason: reason ?? null,
      reference_doc: null,
      from_owner_user_id: fromOwner,
      to_owner_user_id: null,
      from_location_id: fromLoc,
      to_location_id: toLoc.location_id,
    });

    return a;
  },

  // 폐기: RECEIVED/RETURNED -> DISPOSED
  disposeAsset: async (asset_id: number, performed_by: number, reason: string) => {
    if (!reason?.trim()) throw new Error("Dispose reason is required");
    const a = assertAssetExists(asset_id);
    if (a.current_status !== "RECEIVED" && a.current_status !== "RETURNED") {
      throw new Error("Only RECEIVED or RETURNED assets can be disposed");
    }

    const performer = getUser(performed_by);

    const fromStatus = a.current_status;
    const fromOwner = a.current_owner?.user_id ?? null;
    const fromLoc = a.current_location?.location_id ?? null;

    a.current_status = "DISPOSED";
    a.current_owner = null;

    pushEvent({
      asset_id,
      event_type: "DISPOSED",
      performed_by: performer,
      from_status: fromStatus,
      to_status: "DISPOSED",
      reason,
      reference_doc: null,
      from_owner_user_id: fromOwner,
      to_owner_user_id: null,
      from_location_id: fromLoc,
      to_location_id: fromLoc,
    });

    return a;
  },

  /* -------- PO 조회/생성 -------- */
  listPOs: async (): Promise<PurchaseOrder[]> => pos,
  getPO: async (po_id: number): Promise<PurchaseOrder | null> => pos.find(p => p.po_id === po_id) ?? null,
  listPoLines: async (po_id: number): Promise<PurchaseOrderLine[]> => poLines.filter(l => l.po_id === po_id),

  createPO: async (input: Omit<PurchaseOrder, "po_id">): Promise<PurchaseOrder> => {
    if (!input.purchase_reason?.trim()) throw new Error("purchase_reason is required");
    if (!input.purchased_at?.trim()) throw new Error("purchased_at is required");
    if (!input.requested_by) throw new Error("requested_by is required");

    const newPo: PurchaseOrder = {
      ...input,
      po_id: Math.max(0, ...pos.map(p => p.po_id)) + 1,
    };
    pos = [newPo, ...pos];
    return newPo;
  },

  addPoLine: async (input: Omit<PurchaseOrderLine, "po_line_id">): Promise<PurchaseOrderLine> => {
    if (!input.po_id) throw new Error("po_id is required");
    if (!input.item_category?.trim()) throw new Error("item_category is required");
    if (!input.qty_ordered || input.qty_ordered <= 0) throw new Error("qty_ordered must be > 0");

    const newLine: PurchaseOrderLine = {
      ...input,
      po_line_id: Math.max(0, ...poLines.map(l => l.po_line_id)) + 1,
    };
    poLines = [...poLines, newLine];
    return newLine;
  },

  /* -------- 입고: PO Line -> Assets 생성 -------- */
  receiveFromPoLine: async (
    po_line_id: number,
    qty_received: number,
    location_id: number,
    performed_by: number,
    reference_doc?: string
  ): Promise<Asset[]> => {
    if (qty_received <= 0) throw new Error("qty_received must be > 0");

    const line = poLines.find(l => l.po_line_id === po_line_id);
    if (!line) throw new Error("PO line not found");

    const po = pos.find(p => p.po_id === line.po_id) ?? null;
    const loc = getLocation(location_id);
    const performer = getUser(performed_by);

    const baseAssetId = Math.max(0, ...assets.map(a => a.asset_id));
    const year = String(new Date().getFullYear());

    const created: Asset[] = Array.from({ length: qty_received }).map((_, i) => {
      const asset_id = baseAssetId + i + 1;
      const asset_tag = `IT-${year}-${String(asset_id).padStart(6, "0")}`;
      return {
        asset_id,
        asset_tag,
        current_status: "RECEIVED",
        current_owner: null,
        current_location: loc,
        acquisition_date: po?.purchased_at,
        po_line_id: line.po_line_id,
      };
    });

    assets = [...created, ...assets];

    created.forEach(a => {
      pushEvent({
        asset_id: a.asset_id,
        event_type: "RECEIVED",
        performed_by: performer,
        from_status: null,
        to_status: "RECEIVED",
        reason: null,
        reference_doc: reference_doc ?? null,
        from_owner_user_id: null,
        to_owner_user_id: null,
        from_location_id: null,
        to_location_id: loc.location_id,
      });
    });

    return created;
  },
};
