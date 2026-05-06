# Feature Specification: Admin Users, RBAC & Ditto Thing Provisioning

**Feature Branch**: `[009-admin-users-ditto-thing-management]`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: Operational need for web-admin flows: user lifecycle, role-based access control, and CRUD for Ditto Things (elevators) mediated exclusively by the backend.

> **Ghi chú (VI)**: Tài liệu theo chuẩn Spec Kit. Phạm vi: tạo/quản lý người dùng, phân quyền theo vai trò và phạm vi tòa nhà, API backend thực hiện CRUD Thing trên Ditto (không gọi Ditto từ trình duyệt).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Identity & Roles (Priority: P1)

A signed-in user receives a token whose claims encode their **roles** and **building scope** (and optional resource limits). The backend enforces authorization on every admin and provisioning route.

**Why this priority**: Without trustworthy identity and RBAC, Thing provisioning cannot be safely exposed.

**Independent Test**: Issue tokens for `operator`, `building_admin`, and `platform_admin`; call a protected route with each and verify allow/deny matrix per contract.

**Acceptance Scenarios**:

1. **Given** a user with only `operator` role, **When** they call Thing create/update/delete, **Then** the API returns 403 with a stable error code.
2. **Given** a user with `building_admin` scoped to `L72`, **When** they provision a Thing with `buildingId=L72`, **Then** the request is accepted (subject to validation).
3. **Given** a user with `building_admin` scoped to `L72`, **When** they provision a Thing for `buildingId=L99`, **Then** the API returns 403 (out of scope).

---

### User Story 2 - Admin Creates & Manages Application Users (Priority: P1)

A `platform_admin` (or delegated identity provider sync) can create, disable, list, and reset credentials for dashboard users. User records are stored in the application’s user store (or delegated IdP); the backend maps users to roles and building scopes.

**Why this priority**: Provisioning operators/admins is prerequisite for controlled Ditto operations.

**Independent Test**: Create user, assign role + buildings, authenticate, verify JWT claims match assignment; disable user and verify token revocation or login denial.

**Acceptance Scenarios**:

1. **Given** a `platform_admin`, **When** they create a user with email + initial role, **Then** the user appears in list and cannot log in until activation rules are satisfied (if applicable).
2. **Given** an active user, **When** admin revokes access, **Then** subsequent API calls fail with 401/403 per policy.
3. **Given** password or SSO flows, **When** documented, **Then** secrets never appear in logs and passwords meet policy.

---

### User Story 3 - CRUD Ditto Things via Backend (Priority: P2)

A `building_admin` (or `platform_admin`) creates, reads, updates, and deletes (or archives) **elevator Things** through backend APIs. The backend validates payloads, applies Ditto policies, calls Ditto HTTP API using **server credentials**, and emits audit events. The browser never holds Ditto passwords.

**Why this priority**: Completes the operational loop from “empty building” to “Twin visible in dashboard” without dev-only seed routes.

**Independent Test**: Create Thing via API; verify Ditto contains Thing; update partial properties; list via existing `/elevators` bootstrap; delete or deprecate per policy and verify dashboard behavior.

**Acceptance Scenarios**:

1. **Given** valid elevator Thing payload and in-scope admin, **When** `POST` create runs, **Then** Ditto `upsertThing` succeeds and bootstrap returns the new elevator.
2. **Given** malformed or incomplete properties, **When** create/update runs, **Then** API returns 400 with Zod (or equivalent) error detail; Ditto is not left in inconsistent state.
3. **Given** delete is not allowed by policy, **When** client calls delete, **Then** API returns 409/403 with reason; optional “archive” path is documented.
4. **Given** every mutation, **When** operation completes, **Then** an audit record exists (who, when, buildingId, thingId, action).

---

### User Story 4 - Observability & Safety (Priority: P3)

Failed Ditto calls, scope violations, and validation errors are logged with correlation IDs; rate limits protect provisioning endpoints in production.

**Why this priority**: Prevents abuse and speeds up incident response.

**Independent Test**: Simulate Ditto timeout and Ditto 409; verify structured logs and client-facing error envelope `{ success, data, error }`.

**Acceptance Scenarios**:

1. **Given** Ditto unavailable, **When** create Thing, **Then** API returns 503 with retry guidance; no partial user-visible state without explicit degraded mode.
2. **Given** high request volume, **When** limits trigger, **Then** 429 with `Retry-After` where configured.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate admin and operator users via the chosen mechanism (JWT session from backend or external IdP integration documented in plan).
- **FR-002**: System MUST enforce RBAC: at minimum roles `platform_admin`, `building_admin`, `operator`, `viewer` (exact set may be trimmed in implementation but must be documented).
- **FR-003**: System MUST bind `building_admin` and `operator` to one or more `buildingId` values in claims or server-side profile.
- **FR-004**: All Ditto Thing mutations MUST execute server-side using Ditto technical credentials; browsers MUST NOT receive Ditto basic auth or API keys.
- **FR-005**: Create/update elevator Thing payloads MUST be validated against a versioned schema aligned with `elevator` feature properties (see data-model).
- **FR-006**: System MUST write audit records for user admin actions and Thing CRUD (immutable log or DB table per plan).
- **FR-007**: Production MUST NOT expose unauthenticated `POST /dev/ditto/seed`; provisioning uses dedicated secured routes.

### Key Entities *(include if feature involves data)*

- **User**: application identity, status, auth binding, assigned roles, building scope.
- **RoleAssignment**: maps user to role + optional building set.
- **ThingProvisioningRequest**: validated input for create/update elevator Thing.
- **AuditRecord**: actor, action, target, timestamp, correlation id, outcome.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100% of Thing CRUD paths require authentication and pass RBAC checks in contract tests.
- **SC-002**: No E2E or integration test relies on browser-to-Ditto traffic.
- **SC-003**: Documented quickstart provisions one elevator via API (non-dev route) and it appears in dashboard within one refresh/bootstrap cycle.

---

## Assumptions

- Ditto remains authoritative for live Twin data; backend continues to normalize and publish to existing realtime channels after mutations.
- Initial release may scope **elevator** Things only; generic Thing types are future work unless plan expands.

---

## Out of Scope (initial cut)

- Self-service public registration without admin approval.
- Full IAM product (MFA, SCIM) unless explicitly added in research phase.
- Direct policy editing UI for Ditto ACLs (may remain API-only).
