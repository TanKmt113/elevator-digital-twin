# Contract: Authentication & RBAC

**Feature**: `009-admin-users-ditto-thing-management`  
**Owner**: Backend

## Goals

- Single, documented JWT (or session) contract for dashboard and admin clients.  
- Enforce **role** and **building scope** on every sensitive route.  
- Never expose Ditto credentials to the client.

## Roles (baseline)

| Role | Description | Typical capabilities |
|------|-------------|---------------------|
| `platform_admin` | Global operations | User CRUD, all buildings, Thing CRUD, audit read |
| `building_admin` | Building-scoped admin | Thing CRUD within assigned buildings; optional user invite within building (future) |
| `operator` | Day-to-day ops | Read state, commands (existing), no Thing CRUD |
| `viewer` | Read-only | Read APIs only |

## JWT claims (normative for MVP)

```json
{
  "sub": "user-uuid",
  "email": "admin@example.com",
  "roles": ["building_admin"],
  "buildings": ["L72"],
  "iat": 1715000000,
  "exp": 1715086400
}
```

**Rules**:

- `platform_admin`: MAY omit `buildings` or use sentinel; server treats as all buildings allowed by configuration.
- `building_admin` / `operator` / `viewer`: MUST include `buildings` non-empty (unless single-tenant deployment documents exception).

## Authorization matrix (minimum)

| Endpoint family | platform_admin | building_admin | operator | viewer |
|-----------------|----------------|----------------|----------|--------|
| `POST/PUT/PATCH/DELETE` Thing provisioning | ✓ | ✓ (in scope) | ✗ | ✗ |
| `GET` Thing detail (admin) | ✓ | ✓ (in scope) | ✗* | ✗* |
| User admin (`/admin/users/*`) | ✓ | ✗** | ✗ | ✗ |
| Existing `/elevators` read | ✓ | ✓ | ✓ | ✓ |

\* Operators use existing product routes, not necessarily separate admin GET by `thingId`.  
\*\* Optional future: building_admin invites operators.

## Error responses

- **401** `UNAUTHENTICATED` — missing or invalid token  
- **403** `FORBIDDEN` — role or building scope insufficient  
- **403** `OUT_OF_SCOPE` — `buildingId` in body/path not in `buildings` claim

Envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient role for Thing provisioning"
  }
}
```

## Middleware order

1. Authenticate (resolve `req.user` / claims)  
2. Authorize role  
3. Authorize building scope for resource  
4. Handler + audit

## Security notes

- Store `passwordHash` with Argon2id or bcrypt (work factor per org policy).  
- Rate-limit `POST /auth/login` and admin mutations.  
- Log auth failures without leaking whether email exists (optional unified message).
