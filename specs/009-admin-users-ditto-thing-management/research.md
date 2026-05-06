# Research: Admin Users, RBAC & Ditto Thing Provisioning

**Feature**: `009-admin-users-ditto-thing-management` | **Date**: 2026-05-06

## Decisions (to confirm before implementation)

### R1 — Identity store

| Option | Pros | Cons |
|--------|------|------|
| A. Local DB users + bcrypt/argon2 | Full control, works offline dev | Must implement reset, lockout, migrations |
| B. External IdP (OIDC) | MFA, SSO | More moving parts, mapping roles to `buildingId` |

**Recommendation**: Start with **A** for MVP if no IdP exists; abstract `UserRepository` for future **B**.

### R2 — JWT claims shape

Proposed claims (illustrative):

- `sub`: user id  
- `roles`: string[] e.g. `["building_admin"]`  
- `buildings`: string[] e.g. `["L72"]` — omit or empty for `platform_admin` (meaning all buildings per server rule)  
- `iat`, `exp`, optional `jti` for revocation lists

**Recommendation**: Document exact claim names in `contracts/auth-rbac.md` and enforce in middleware once.

### R3 — Ditto delete vs archive

| Option | Pros | Cons |
|--------|------|------|
| Hard delete Thing | Clean | May break references, audit trail |
| Soft archive (attribute `archivedAt`) | Safer for Twin history | Dashboard must filter |

**Recommendation**: Prefer **soft archive** for production; hard delete only `platform_admin` + explicit confirmation + audit.

### R4 — Policy attachment

New Things must receive correct `policyId` (reuse `org.example:l72-elevator-policy` pattern from seed or per-environment policy registry).

**Recommendation**: Config map `buildingId -> defaultElevatorPolicyId` in env or DB.

### R5 — Relationship to dev seed

`POST /dev/ditto/seed` remains **development only**. Production provisioning uses `POST /api/v1/...` routes (exact path in contract).

## Open Questions

1. Is multi-tenant DNS/path isolation required for admin APIs?  
2. Are elevator `thingId` namespaces fixed (`org.example:`) or per customer?  
3. Required compliance (password policy, retention for audit logs)?

## References (repository)

- `backend/src/integrations/ditto/ditto-client.ts` — extend as needed  
- `backend/src/api/routes/dev-ditto.routes.ts` — reference for `upsertThing` usage (not for prod)  
- `infra/ditto/local-l72-elevators.json` — reference payload shape for elevator Things
