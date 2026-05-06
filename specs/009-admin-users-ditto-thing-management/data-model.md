# Data Model: Admin Users, RBAC & Ditto Thing Provisioning

**Feature**: `009-admin-users-ditto-thing-management`

## Entities

### User

| Field | Type | Notes |
|-------|------|--------|
| `userId` | UUID | Primary key |
| `email` | string | Unique, normalized lowercase |
| `status` | enum | `active`, `disabled`, `pending` |
| `passwordHash` | string? | Null if SSO-only (future) |
| `createdAt`, `updatedAt` | ISO-8601 | |
| `lastLoginAt` | ISO-8601? | Optional |

### RoleAssignment

| Field | Type | Notes |
|-------|------|--------|
| `assignmentId` | UUID | |
| `userId` | UUID | FK → User |
| `role` | enum | `platform_admin`, `building_admin`, `operator`, `viewer` |
| `buildingIds` | string[] | Empty means “no building scope” unless role implies global |

**Rule**: `platform_admin` may ignore `buildingIds` for authorization (all buildings). `building_admin` MUST have ≥1 building. `operator` / `viewer` MUST have ≥1 building for data routes.

### AuditRecord

| Field | Type | Notes |
|-------|------|--------|
| `auditId` | UUID | |
| `actorUserId` | UUID | |
| `action` | string | e.g. `user.create`, `thing.create`, `thing.update` |
| `resourceType` | string | `user`, `ditto_thing`, … |
| `resourceId` | string | thingId or userId |
| `buildingId` | string? | |
| `payloadSummary` | JSON | Redacted snapshot (no secrets) |
| `outcome` | enum | `success`, `failure` |
| `correlationId` | string | Request id |
| `createdAt` | ISO-8601 | |

### DittoThing (elevator) — provisioning view

Logical shape aligns with existing seed file and `DittoThing` in backend:

- `thingId`: string (namespaced)  
- `policyId`: string  
- `attributes`: `{ buildingId, deviceType: "elevator", shaftId?, ... }`  
- `features.elevator.properties`: full operational properties per enhanced Twin contract

Versioning: bump `schemaVersion` on twin events if needed; Thing `features` follow Ditto merge semantics.

## State transitions

- **User**: `pending` → `active` (after activation); `active` → `disabled`  
- **Thing**: `active` → `archived` (soft delete) via attribute or feature flag

## ER sketch (logical)

```text
User 1──* RoleAssignment
User 1──* AuditRecord (as actor)
```

Ditto Things are **not** duplicated in app DB unless a **registry** table is introduced for search — optional optimization:

### ThingRegistry (optional)

| Field | Notes |
|-------|--------|
| `thingId`, `buildingId`, `shaftId`, `createdAt`, `archivedAt` | For fast admin list without listing all Ditto things |

If omitted, admin list can call Ditto search API or reuse existing bootstrap list with cache invalidation after mutations.
