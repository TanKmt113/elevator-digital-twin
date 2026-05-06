# Quickstart: Admin Users & Ditto Thing Provisioning (draft)

**Feature**: `009-admin-users-ditto-thing-management`

## Prerequisites

- Ditto running; backend configured with `DITTO_HTTP_URL` and service credentials.  
- JWT secret / auth mode configured (extend existing `DEV_AUTH_ENABLED` flow or new login route).  
- First `platform_admin` user bootstrapped (env seed or migration — to implement).

## Dev validation sequence

1. **Test / local seed**: With `NODE_ENV=test`, the backend seeds `admin@example.com` / `test-admin-pass` (`platform_admin`). In other modes, set `BOOTSTRAP_ADMIN_EMAIL` + `BOOTSTRAP_ADMIN_PASSWORD` once on an empty user store.  
2. `POST /api/v1/auth/login` with `{ "email", "password" }` → `{ success, data: { token, user } }`.  
3. `POST /api/v1/admin/users` (Bearer platform admin) — create `building_admin` scoped to `L72`.  
4. `POST /api/v1/auth/login` as that user (when password auth is enabled for them) **or** mint a JWT with claims per [auth-rbac.md](./contracts/auth-rbac.md).  
5. `POST /api/v1/buildings/L72/elevators/things` with body from [ditto-thing-crud-api.md](./contracts/ditto-thing-crud-api.md).  
6. `GET /elevators?buildingId=L72` (existing operator JWT) — assert new `elevatorId` appears after backend refresh.  
7. Open dashboard fleet/overview — assert row visible.  
8. `PATCH /api/v1/buildings/L72/elevators/things/:thingId` with `{ "properties": { ... } }`.  
9. `POST /api/v1/buildings/L72/elevators/things/:thingId/archive`.  
10. Attempt provisioning as `operator` — expect **403** on `POST .../things`.

## Production notes

- Disable or block `POST /dev/ditto/seed`.  
- Use secrets manager for Ditto credentials and JWT signing key rotation.  
- Enable rate limiting on admin and provisioning routes.
