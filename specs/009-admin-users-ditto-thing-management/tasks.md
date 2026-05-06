# Tasks: 009 Admin Users & Ditto Thing Provisioning

**Input**: `specs/009-admin-users-ditto-thing-management/` (plan, spec, contracts, data-model, research, quickstart)  
**Prerequisites**: plan.md, spec.md, contracts/

**Tests**: Contract + integration tests for auth matrix and provisioning (no browser→Ditto).

## Phase 1: Setup

- [X] T001 Add `zod` dependency and `DEFAULT_ELEVATOR_POLICY_ID` / bootstrap env keys in `backend/package.json` and `backend/.env.example`
- [X] T002 Point Speckit active feature to 009 in `.specify/feature.json` (optional per branch)

## Phase 2: Foundational — Auth model & Ditto errors

- [X] T003 Implement JWT claim normalization (`sub`, `roles[]`, `buildings[]`) in `backend/src/modules/auth/auth.types.ts`
- [X] T004 Extend `authenticateJwt` + `hasBuildingScope` in `backend/src/modules/auth/auth.middleware.ts`
- [X] T005 Extend RBAC helpers (`requireRoles`, `requirePlatformAdmin`, `requireThingProvisioningRole`) in `backend/src/modules/auth/rbac.ts`
- [X] T006 Align WebSocket JWT auth with multi-building + `platform_admin` in `backend/src/modules/realtime/ws-server.ts`
- [X] T007 Emit richer dev JWT from `backend/src/api/routes/dev-auth.routes.ts`
- [X] T008 Add `DittoRequestError`, `getThingOrNull`, `mergePatchThing` in `backend/src/integrations/ditto/ditto-client.ts`
- [X] T009 Add CORS `X-Correlation-Id` in `backend/src/api/server.ts` (`applyCorsHeaders`)

## Phase 3: User Story 1 — Identity & RBAC (P1)

- [X] T010 [US1] Password hashing (`scrypt`) in `backend/src/modules/auth/password.ts`
- [X] T011 [US1] Sign JWT for users in `backend/src/modules/auth/jwt-sign.ts`
- [X] T012 [P] [US1] In-memory user repository in `backend/src/modules/users/in-memory-user.repository.ts`
- [X] T013 [US1] `POST /api/v1/auth/login` + envelope helpers in `backend/src/api/http/envelope.ts` and `backend/src/api/routes/api-v1.routes.ts`
- [X] T014 [US1] Integration test matrix (login, operator 403, out-of-scope 403) in `backend/tests/integration/admin-things-api.integration.test.ts`

## Phase 4: User Story 2 — Admin users (P1)

- [X] T015 [US2] In-memory audit repository in `backend/src/modules/audit/audit.repository.ts`
- [X] T016 [US2] `GET/POST /api/v1/admin/users` (platform_admin only) in `backend/src/api/routes/api-v1.routes.ts`

## Phase 5: User Story 3 — Thing CRUD (P2)

- [X] T017 [US3] Zod provisioning schemas in `backend/src/modules/provisioning/elevator-thing.schema.ts`
- [X] T018 [US3] `ThingProvisioningService` in `backend/src/modules/provisioning/thing-provisioning.service.ts`
- [X] T019 [US3] Routes: create, get, patch, archive under `/api/v1/buildings/:buildingId/elevators/things` in `backend/src/api/routes/api-v1.routes.ts`
- [X] T020 [US3] Mount `createApiV1Router` + `bootstrapAdminFromEnv` + test seed in `backend/src/api/server.ts`
- [X] T021 [US3] Command building scope uses `buildingIds` / `platform_admin` in `backend/src/modules/elevators/command-execution.service.ts`
- [X] T022 [US3] Widen elevator/command route roles in `backend/src/api/routes/elevators.routes.ts` and `commands.routes.ts`

## Phase 6: Polish / follow-ups (P3+)

- [X] T023 [P] Rate limiting for `/api/v1/auth/login` and provisioning mutations in `backend/src/api/middleware/memory-rate-limit.ts` and `backend/src/api/routes/api-v1.routes.ts` (`API_V1_LOGIN_RPM`, `API_V1_PROVISION_RPM`, `API_RATE_LIMIT_DISABLED`)
- [X] T024 [P] PostgreSQL-backed `UserRepository` + audit persistence (replace in-memory)
- [X] T025 [P] Frontend admin module under `frontend/src/modules/admin/` per plan
- [X] T026 Contract/OpenAPI publish for `/api/v1/*` in `specs/004-ditto-end-to-end/contracts/backend-api.yaml` or new bundle

## Dependencies

- Phase 2 blocks US1–US3. US2/US3 depend on US1 auth paths. US3 depends on Ditto client extensions (T008).

## MVP

Phases 1–5: secured login, admin user create/list, scoped elevator Thing provisioning with audit + tests.
