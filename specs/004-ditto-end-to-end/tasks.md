---

description: "Task list for Ditto End-to-End Digital Twin Runtime"
---

# Tasks: Ditto End-to-End Digital Twin Runtime

**Input**: Design documents from `/specs/004-ditto-end-to-end/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include backend contract, Ditto bootstrap, Ditto live event, websocket, frontend bootstrap, frontend realtime, auth/scope, and quickstart validation coverage. AI-service tests are out of scope for this phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Story label for story-phase tasks only
- Every task includes an exact file path

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Infra**: `infra/`
- **Docs/Specs**: `docs/`, `specs/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish phase-4 runtime references, validation commands, and local Ditto dataset locations.

- [X] T001 Update phase-4 references in AGENTS.md, README.md, docs/operations-dashboard.md, and docs/ditto-integration.md for specs/004-ditto-end-to-end/
- [X] T002 [P] Add phase-4 validation scripts and environment documentation in backend/package.json, frontend/package.json, backend/src/config/env.ts, and frontend/src/services/api/client.ts
- [X] T003 [P] Add local Ditto dataset and seed script entry points in infra/ditto/local-l72-elevators.json and infra/ditto/seed-ditto.ts
- [X] T004 [P] Update local infrastructure notes and compose placeholders for Ditto in infra/README.md and infra/docker/docker-compose.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared runtime contracts, health state, auth scope, and event envelopes required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define phase-4 synchronization and health contracts in backend/src/contracts/elevator.ts and frontend/src/store/realtime-store.ts
- [X] T006 [P] Add shared realtime envelope and rejection-counter tests in backend/tests/integration/elevator-realtime-resilience.test.ts and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T007 [P] Implement local developer auth contract in backend/src/modules/auth/dev-auth.routes.ts and backend/tests/contract/auth.contract.test.ts
- [X] T008 [P] Extend backend environment and settings for Ditto live, dev auth, and reconnect defaults in backend/src/config/env.ts and backend/src/config/settings.ts
- [X] T009 Add scoped authorization helpers for REST and websocket building access in backend/src/modules/auth/rbac.ts and backend/src/modules/auth/auth.middleware.ts
- [X] T010 Add synchronization health metrics and structured log fields in backend/src/observability/elevator-monitoring.metrics.ts and backend/src/observability/logger.ts
- [X] T011 [P] Refresh phase-4 API and realtime contracts after foundational decisions in specs/004-ditto-end-to-end/contracts/backend-api.yaml and specs/004-ditto-end-to-end/contracts/realtime-events.md

**Checkpoint**: Shared runtime contracts, auth scope, and observability foundation are ready.

---

## Phase 3: User Story 1 - Bootstrap From Live Twin Data (Priority: P1) MVP

**Goal**: Operators see current elevator state loaded from Ditto through the backend before any new live event arrives.

**Independent Test**: Start backend with a seeded Ditto-compatible source, load the dashboard, and verify authorized building elevators plus synchronization metadata appear from REST bootstrap.

### Tests for User Story 1

- [X] T012 [P] [US1] Add contract test for scoped elevator listing, detail lookup, and synchronization metadata in backend/tests/contract/elevators.contract.test.ts
- [X] T013 [P] [US1] Add integration test for Ditto seed bootstrap completed, empty, partial, malformed, and failed states in backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts
- [X] T014 [P] [US1] Add frontend bootstrap integration test for REST elevator loading and degraded bootstrap states in frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T015 [US1] Add quickstart bootstrap validation coverage in frontend/tests/e2e/quickstart-flow.spec.ts

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement idempotent local Ditto seed dataset loading in infra/ditto/seed-ditto.ts and infra/ditto/local-l72-elevators.json
- [X] T017 [P] [US1] Harden Ditto HTTP bootstrap projection and rejected Thing reporting in backend/src/integrations/ditto/ditto-client.ts and backend/src/modules/realtime/event-normalizer.ts
- [X] T018 [US1] Extend Twin bootstrap run state and health reporting in backend/src/modules/elevators/elevator-monitoring.service.ts and backend/src/api/server.ts
- [X] T019 [US1] Enforce building scope in elevator REST list/detail responses in backend/src/api/routes/elevators.routes.ts and backend/src/modules/elevators/elevator-state.repository.ts
- [X] T020 [P] [US1] Implement frontend REST bootstrap service and store hydration in frontend/src/services/api/client.ts and frontend/src/store/elevator-store.ts
- [X] T021 [US1] Wire dashboard startup bootstrap and visible loading/empty/degraded states in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinScene.tsx
- [X] T022 [US1] Document bootstrap setup, seed commands, and failure interpretation in specs/004-ditto-end-to-end/quickstart.md and docs/ditto-integration.md

**Checkpoint**: Current Twin state loads into backend and frontend from Ditto with explicit readiness.

---

## Phase 4: User Story 2 - Receive Live Twin Events End-to-End (Priority: P1)

**Goal**: Accepted live Twin changes flow from Ditto through backend normalization and websocket publishing into all dashboard projections without duplicate or stale transitions.

**Independent Test**: Replay accepted, duplicate, late, malformed, and out-of-scope Ditto events and verify only accepted state changes reach connected dashboard clients.

### Tests for User Story 2

- [X] T023 [P] [US2] Add Ditto live event projection tests in backend/tests/integration/ditto-client.integration.test.ts
- [X] T024 [P] [US2] Add backend live reconciliation and rejection-counter tests in backend/tests/integration/elevator-monitoring.integration.test.ts
- [X] T025 [P] [US2] Add backend websocket publishing and scoped delivery tests in backend/tests/integration/realtime-bootstrap.test.ts
- [X] T026 [US2] Add frontend realtime websocket event application and resync tests in frontend/tests/integration/elevator-dashboard-live.test.tsx

### Implementation for User Story 2

- [X] T027 [P] [US2] Implement Ditto live consumer adapter with bounded reconnect in backend/src/integrations/ditto/ditto-live-consumer.ts
- [X] T028 [P] [US2] Implement Ditto live payload projection and malformed event handling in backend/src/integrations/ditto/ditto-client.ts and backend/src/modules/realtime/event-normalizer.ts
- [X] T029 [US2] Integrate live events with EventRouter, ElevatorMonitoringService, and rejection counters in backend/src/modules/realtime/event-router.ts and backend/src/modules/elevators/elevator-monitoring.service.ts
- [X] T030 [US2] Implement real backend websocket server sessions, scoped delivery, active session tracking, and close handling in backend/src/modules/realtime/ws-server.ts
- [X] T031 [US2] Publish accepted elevator and synchronization state events to websocket clients in backend/src/modules/realtime/publishers/elevator-state.publisher.ts and backend/src/api/server.ts
- [X] T032 [P] [US2] Implement browser websocket client with reconnect and message dispatch in frontend/src/services/realtime/ws-client.ts and frontend/src/services/realtime/elevator-events.ts
- [X] T033 [US2] Wire frontend realtime startup, resync-required handling, and stale state updates in frontend/src/app/App.tsx and frontend/src/store/realtime-store.ts
- [X] T034 [US2] Document live event replay, rejection semantics, and reconnect behavior in specs/004-ditto-end-to-end/contracts/ditto-live-events.md and specs/004-ditto-end-to-end/quickstart.md

**Checkpoint**: Ditto live events update dashboard state end-to-end through backend websocket delivery.

---

## Phase 5: User Story 3 - Operate With Real Client Connectivity (Priority: P2)

**Goal**: Operators use the frontend against the backend with authenticated REST and websocket access, scoped state, reconnect behavior, and clear access/degraded states.

**Independent Test**: Authenticate as an operator, load current state, connect realtime, drop/reconnect transport, and verify scoped access plus visible synchronization quality.

### Tests for User Story 3

- [X] T035 [P] [US3] Add developer operator token and forbidden-scope contract tests in backend/tests/contract/auth.contract.test.ts
- [X] T036 [P] [US3] Add websocket authentication and building-scope integration tests in backend/tests/integration/realtime-bootstrap.test.ts
- [X] T037 [P] [US3] Add frontend unauthorized, forbidden, reconnecting, and resync UI tests in frontend/tests/integration/app-shell.test.ts and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T038 [US3] Add operator browser flow coverage for token, REST bootstrap, websocket live, and reconnect in frontend/tests/e2e/quickstart-flow.spec.ts

### Implementation for User Story 3

- [X] T039 [P] [US3] Implement dev-only operator token route and environment guard in backend/src/modules/auth/dev-auth.routes.ts and backend/src/api/server.ts
- [X] T040 [P] [US3] Enforce JWT and building scope during websocket upgrade in backend/src/modules/realtime/ws-server.ts and backend/src/modules/auth/auth.middleware.ts
- [X] T041 [US3] Add frontend auth token configuration and scoped API headers in frontend/src/services/api/client.ts and frontend/src/store/session-store.ts
- [X] T042 [US3] Add frontend access, forbidden, reconnecting, and resync presentation in frontend/src/app/App.tsx and frontend/src/store/realtime-store.ts
- [X] T043 [P] [US3] Preserve shared selected elevator state across bootstrap resync and realtime reconnect in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts
- [X] T044 [US3] Document operator auth, local token issuance, and scoped websocket access in specs/004-ditto-end-to-end/quickstart.md and docs/operations-dashboard.md

**Checkpoint**: Authenticated browser clients can bootstrap, subscribe, reconnect, and resync through backend-only paths.

---

## Phase 6: User Story 4 - Run A Repeatable Local Digital Twin Demo (Priority: P2)

**Goal**: Developers can start local infrastructure, seed Ditto, run backend/frontend, replay live updates, and validate degraded behavior from documented commands.

**Independent Test**: Follow the quickstart from a clean local environment and complete bootstrap, live update, stale/degraded, and 3D selection validation without AI services.

### Tests for User Story 4

- [X] T045 [P] [US4] Add seed dataset validation tests in backend/tests/integration/ditto-client.integration.test.ts
- [X] T046 [P] [US4] Add quickstart command smoke tests and AI-exclusion assertions in frontend/tests/e2e/quickstart-flow.spec.ts
- [X] T047 [P] [US4] Add degraded Ditto and websocket failure-mode tests in backend/tests/integration/elevator-realtime-resilience.test.ts and frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 4

- [X] T048 [P] [US4] Add local Ditto services, environment examples, and seed wiring in infra/docker/docker-compose.yml and infra/README.md
- [X] T049 [P] [US4] Add replay fixtures for accepted, duplicate, late, malformed, and out-of-scope events in infra/ditto/replay-events.json and infra/ditto/replay-ditto-event.ts
- [X] T050 [US4] Add health output for Ditto HTTP, Ditto live, frontend sessions, and rejection counters in backend/src/api/server.ts and backend/src/observability/elevator-monitoring.metrics.ts
- [X] T051 [US4] Add dashboard degraded and validation-ready indicators for local demo in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [X] T052 [US4] Finalize step-by-step local runbook in specs/004-ditto-end-to-end/quickstart.md, docs/ditto-integration.md, and infra/observability/runbook.md

**Checkpoint**: Local end-to-end Digital Twin demo can be run and validated from documentation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final contract alignment, validation, documentation, and release readiness.

- [X] T053 [P] Refresh final phase-4 contracts in specs/004-ditto-end-to-end/contracts/backend-api.yaml, specs/004-ditto-end-to-end/contracts/realtime-events.md, specs/004-ditto-end-to-end/contracts/ditto-seed-dataset.md, and specs/004-ditto-end-to-end/contracts/ditto-live-events.md
- [X] T054 [P] Run and document backend validation in backend/package.json and specs/004-ditto-end-to-end/quickstart.md
- [X] T055 [P] Run and document frontend validation in frontend/package.json and specs/004-ditto-end-to-end/quickstart.md
- [X] T056 Harden operational alerts and troubleshooting guidance in infra/observability/runbook.md and docs/operations-dashboard.md
- [X] T057 Validate no frontend direct Ditto access and no AI-service dependency in frontend/src/, backend/src/, and specs/004-ditto-end-to-end/quickstart.md
- [X] T058 Mark implementation completion state in specs/004-ditto-end-to-end/tasks.md after all validation passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational. This is the MVP and provides Ditto-backed current state.
- **US2 (P1)**: Starts after Foundational, but practically depends on US1 normalization and materialized state semantics for full end-to-end validation.
- **US3 (P2)**: Starts after Foundational and integrates with US1 REST bootstrap plus US2 websocket delivery.
- **US4 (P2)**: Depends on US1-US3 behaviors to produce a repeatable local demo.

### Within Each User Story

- Tests MUST be written before implementation.
- Contracts and data/state models come before service and endpoint changes.
- Backend normalization and authorization come before frontend rendering.
- Realtime consumers and publishers come before browser realtime integration.
- Observability and degraded behavior are required before a story is considered complete.

### Parallel Opportunities

- T002-T004 can run in parallel after T001.
- T006-T008 and T011 can run in parallel during Foundational after T005 is understood.
- In US1, T012-T014 and T016-T017/T020 can run in parallel across backend, infra, and frontend files.
- In US2, T023-T025 and T027-T028/T032 can run in parallel across Ditto consumer, websocket server, and frontend client slices.
- In US3, T035-T037 and T039-T041 can run in parallel across auth, websocket scope, and frontend session slices.
- In US4, T045-T047 and T048-T049 can run in parallel across seed/replay and failure-mode validation files.

---

## Parallel Example: User Story 1

```bash
# Tests can be created together:
Task: "T012 [US1] backend contract test in backend/tests/contract/elevators.contract.test.ts"
Task: "T013 [US1] Ditto bootstrap integration test in backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts"
Task: "T014 [US1] frontend REST bootstrap integration test in frontend/tests/integration/elevator-dashboard-live.test.tsx"

# Implementation can be split by ownership:
Task: "T016 [US1] infra seed dataset in infra/ditto/"
Task: "T017 [US1] backend Ditto projection in backend/src/integrations/ditto/ and backend/src/modules/realtime/"
Task: "T020 [US1] frontend REST hydration in frontend/src/services/api/ and frontend/src/store/"
```

## Parallel Example: User Story 2

```bash
Task: "T027 [US2] Ditto live consumer in backend/src/integrations/ditto/ditto-live-consumer.ts"
Task: "T030 [US2] backend websocket sessions in backend/src/modules/realtime/ws-server.ts"
Task: "T032 [US2] frontend websocket client in frontend/src/services/realtime/ws-client.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T039 [US3] dev auth route in backend/src/modules/auth/dev-auth.routes.ts"
Task: "T040 [US3] websocket auth in backend/src/modules/realtime/ws-server.ts"
Task: "T041 [US3] frontend session/API headers in frontend/src/services/api/client.ts and frontend/src/store/session-store.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate Ditto-backed bootstrap independently.

### Incremental Delivery

1. Deliver US1 so current Twin state is visible from Ditto.
2. Deliver US2 so live Twin updates reach dashboard clients end-to-end.
3. Deliver US3 so real authenticated browser clients can operate and reconnect.
4. Deliver US4 so the full local Ditto demo is repeatable.
5. Finish with contracts, validation commands, runbooks, and release checks.

## Summary

- Total tasks: 58
- Story task counts: US1 = 11, US2 = 12, US3 = 10, US4 = 8
- MVP scope: Phase 1, Phase 2, and Phase 3 only
- AI service work is intentionally excluded from this phase
