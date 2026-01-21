# Create the api-contract.md file for download

content = """# Asset Management System – API Contract (MVP)

## 1. 목적
본 문서는 자산관리 시스템의 프론트엔드(React), 백엔드(ASP.NET Web API),
DB(MS SQL + Stored Procedure) 간 통신 규격(API Contract)을 정의한다.

- MVP(최소 기능 제품) 기준으로 필요한 규격만 정의한다.
- 기능 확장 시 기존 구조를 깨지 않도록 설계한다.
- 버튼 1개 = API 1개 = Stored Procedure 1개 원칙을 따른다.

---

## 2. 공통 규칙

### 2.1 자산 상태 값 (AssetStatus)
내부 로직에서는 반드시 영문 ENUM만 사용한다.

PO_CREATED | RECEIVED | ISSUED | RETURNED | DISPOSED

---

### 2.2 시간 포맷
- ISO-8601 (UTC)
- 예시: 2026-01-21T01:54:42.675Z

---

### 2.3 이력 관리 원칙
- 모든 상태 변경은 AssetEvents 테이블에 기록
- 지급 / 회수 / 폐기 / 입고는 반드시 이벤트 생성

---

## 3. 공통 DTO

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

## 4. Asset API

### GET /api/assets
자산 목록 조회

### GET /api/assets/{assetId}
자산 상세 조회

### GET /api/assets/{assetId}/timeline
자산 이력 조회

---

## 5. Asset 상태 변경 API

### POST /api/assets/{assetId}/issue
지급 처리
- 허용 상태: RECEIVED, RETURNED
- SP: sp_IssueAsset

### POST /api/assets/{assetId}/return
회수 처리
- 허용 상태: ISSUED
- SP: sp_ReturnAsset

### POST /api/assets/{assetId}/dispose
폐기 처리
- 허용 상태: RECEIVED, RETURNED
- SP: sp_DisposeAsset

---

## 6. Purchase Order (PO)

### GET /api/po
PO 목록

### POST /api/po
PO 생성

### POST /api/po/{poId}/lines
PO 라인 추가

### GET /api/po/{poId}
PO 상세 조회

---

## 7. 입고 처리

### POST /api/po/lines/{poLineId}/receive
입고 처리 (자산 생성)
- SP: sp_ReceiveFromPoLine

---

## 8. 에러 규칙

### 409 INVALID_STATE
상태 전이 불가

### 400 VALIDATION_ERROR
요청 데이터 오류

---

## 9. Stored Procedure 매핑

지급   -> sp_IssueAsset  
회수   -> sp_ReturnAsset  
폐기   -> sp_DisposeAsset  
입고   -> sp_ReceiveFromPoLine  

---

## 10. 비고
- 인증/권한(JWT)은 MVP 이후 적용
- 첨부파일 기능은 추후 확장
"""

path = "/mnt/data/api-contract.md"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
