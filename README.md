# Asset Management System – API Contract (MVP)

## 1. Purpose
This document defines the API contract between the **Frontend (React)**,
**Backend (ASP.NET Web API)**, and **Database (MS SQL with Stored Procedures)**
for the Asset Management System.

- Defines only the minimum required specifications for the MVP.
- Designed to allow future expansion without breaking the existing structure.
- Follows the principle: **One Button = One API = One Stored Procedure**.

---

## 2. Common Rules

### 2.1 Asset Status (AssetStatus)
Internal logic must use **English ENUM values only**.

PO_CREATED | RECEIVED | ISSUED | RETURNED | DISPOSED

---

### 2.2 Time Format
- ISO-8601 (UTC)
- Example: 2026-01-21T01:54:42.675Z

---

### 2.3 Audit / History Policy
- All status changes must be recorded in the AssetEvents table.
- Issue / Return / Dispose / Receive operations must always generate events.

---

## 3. Common DTOs

### UserDto
- user_id: number
- display_name: string
- role: ADMIN | IT | GA | USER

### LocationDto
- location_id: number
- location_name: string

### AssetDto
- asset_id: number
- asset_tag: string
- serial_number?: string
- current_status: AssetStatus
- current_owner?: UserDto
- current_location?: LocationDto
- acquisition_date?: string
- po_id?: number
- po_line_id?: number

### AssetEventDto
- event_id: number
- asset_id: number
- from_status?: AssetStatus
- to_status: AssetStatus
- performed_by: UserDto
- event_time: string
- reason?: string
- reference_doc?: string

---

## 4. Asset APIs

### GET /api/assets
Retrieve asset list

### GET /api/assets/{assetId}
Retrieve asset details

### GET /api/assets/{assetId}/timeline
Retrieve asset timeline (history)

---

## 5. Asset State Change APIs

### POST /api/assets/{assetId}/issue
Issue asset to user
- Allowed states: RECEIVED, RETURNED
- Stored Procedure: sp_IssueAsset

### POST /api/assets/{assetId}/return
Return asset to location
- Allowed states: ISSUED
- Stored Procedure: sp_ReturnAsset

### POST /api/assets/{assetId}/dispose
Dispose asset
- Allowed states: RECEIVED, RETURNED
- Stored Procedure: sp_DisposeAsset

---

## 6. Purchase Order (PO)

### GET /api/po
Retrieve PO list

### POST /api/po
Create a new PO

### POST /api/po/{poId}/lines
Add PO line item

### GET /api/po/{poId}
Retrieve PO details

---

## 7. Receiving (PO → Asset Creation)

### POST /api/po/lines/{poLineId}/receive
Receive items and create assets
- Stored Procedure: sp_ReceiveFromPoLine

---

## 8. Error Handling

### 409 INVALID_STATE
Invalid state transition

### 400 VALIDATION_ERROR
Invalid request data

---

## 9. Stored Procedure Mapping

Issue    -> sp_IssueAsset  
Return   -> sp_ReturnAsset  
Dispose  -> sp_DisposeAsset  
Receive  -> sp_ReceiveFromPoLine  

---

## 10. Notes
- Authentication/Authorization (JWT) will be applied after MVP.
- Attachment features (invoice, disposal evidence) will be added later.
