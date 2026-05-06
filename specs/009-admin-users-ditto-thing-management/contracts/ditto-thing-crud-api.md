# Contract: Ditto Thing CRUD (Elevator) via Backend

**Feature**: `009-admin-users-ditto-thing-management`  
**Consumer**: Admin UI, automation (CI, scripts with service token — future)  
**Producer**: Backend → `DittoClient`

## Principles

- All paths require **Authorization: Bearer &lt;JWT&gt;** unless explicitly documented as internal.  
- Request/response bodies validated with **Zod**; errors use `{ success, data, error }`.  
- Mutations **audit** actor, `thingId`, `buildingId`, action, outcome, `correlationId`.  
- **Idempotency**: `PUT` by `thingId` is upsert; `POST` create rejects duplicate `thingId` with **409** `THING_EXISTS`.

> Path prefix illustrative: `/api/v1` — align with existing server routing in implementation.

---

## Create elevator Thing

`POST /api/v1/buildings/:buildingId/elevators/things`

**Auth**: `platform_admin` | `building_admin` (scope includes `:buildingId`)

**Request body** (minimal; extend to match `infra/ditto/local-l72-elevators.json` shape):

```json
{
  "thingId": "org.example:L72-ELEV-D",
  "shaftId": "shaft-d",
  "policyId": "org.example:l72-elevator-policy",
  "properties": {
    "status": "idle",
    "currentFloor": 1,
    "targetFloor": 1,
    "direction": "stationary",
    "doorState": "closed",
    "healthState": "normal",
    "lastUpdatedAt": "2026-05-06T10:00:00.000Z"
  }
}
```

**Server behavior**:

1. Validate `:buildingId` matches token scope.  
2. Zod-validate body; merge into full `DittoThing` template (defaults for missing optional fields).  
3. `upsertPolicy` if policy missing (optional — prefer pre-provisioned policies in prod).  
4. `upsertThing(thingId, thing)`.  
5. Invalidate or trigger monitoring **resync** if required by architecture.  
6. Return **201** with normalized summary.

**Response 201**:

```json
{
  "success": true,
  "data": {
    "thingId": "org.example:L72-ELEV-D",
    "buildingId": "L72",
    "created": true
  },
  "error": null
}
```

---

## Get elevator Thing (admin)

`GET /api/v1/buildings/:buildingId/elevators/things/:thingId`

**Auth**: `platform_admin` | `building_admin` (in scope)

**Response 200**: Ditto thing JSON subset or full mirror (document field allowlist to avoid leaking internal Ditto metadata if any).

---

## Update elevator Thing (partial)

`PATCH /api/v1/buildings/:buildingId/elevators/things/:thingId`

**Auth**: `platform_admin` | `building_admin` (in scope)

**Request**: Partial `features.elevator.properties` or full feature merge per Ditto semantics (implementation chooses **merge patch** vs replace — document in implementation).

**Response 200**: Updated summary + `schemaVersion` if applicable.

---

## Archive / delete

**Option A — Recommended**:  
`POST /api/v1/buildings/:buildingId/elevators/things/:thingId/archive`

Sets `attributes.archivedAt` or `features.elevator.properties.archived` (exact field in implementation spec).

**Option B**:  
`DELETE /api/v1/buildings/:buildingId/elevators/things/:thingId`  
Only if Ditto policy allows delete and product accepts removal from bootstrap list.

**Auth**: `platform_admin` or `building_admin` (in scope); optionally **delete** restricted to `platform_admin` only.

---

## User administration (sketch)

> Full OpenAPI-style detail can be added in implementation; listed here for Speckit traceability.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/admin/users` | Create user (`platform_admin`) |
| `GET` | `/api/v1/admin/users` | List users (paged) |
| `PATCH` | `/api/v1/admin/users/:userId` | Update status, roles |
| `POST` | `/api/v1/admin/users/:userId/roles` | Replace role assignments |

All return the standard envelope.

---

## Correlation

- Header `X-Correlation-Id` optional from client; server generates if absent and echoes in logs + audit.

## Integration tests (required)

- Scope denial: `building_admin` for `L72` cannot create in `L99`.  
- Happy path create → Ditto contains thing → `GET /elevators` includes new id (after bootstrap refresh if cached).  
- Validation failure → no partial thing in Ditto.
