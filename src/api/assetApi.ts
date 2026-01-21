// src/api/assetApi.ts
import { mockDb } from "./mockDb";

export const assetApi = {
  list: () => mockDb.listAssets(),
  get: (id: number) => mockDb.getAsset(id),
  timeline: (id: number) => mockDb.listTimeline(id),

  issue: (
    asset_id: number,
    to_owner_user_id: number,
    performed_by: number,
    reason?: string
  ) => mockDb.issueAsset(asset_id, to_owner_user_id, performed_by, reason),

  ret: (
    asset_id: number,
    to_location_id: number,
    performed_by: number,
    reason?: string
  ) => mockDb.returnAsset(asset_id, to_location_id, performed_by, reason),

  dispose: (
    asset_id: number,
    performed_by: number,
    reason: string
  ) => mockDb.disposeAsset(asset_id, performed_by, reason),
};
