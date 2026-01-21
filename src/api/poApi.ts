import { mockDb } from "./mockDb";
import type { PurchaseOrder, PurchaseOrderLine } from "./mockDb";

export const poApi = {
  list: () => mockDb.listPOs(),
  get: (po_id: number) => mockDb.getPO(po_id),
  lines: (po_id: number) => mockDb.listPoLines(po_id),

  create: (input: Omit<PurchaseOrder, "po_id">) => mockDb.createPO(input),
  addLine: (input: Omit<PurchaseOrderLine, "po_line_id">) => mockDb.addPoLine(input),
};
