---

description: "Task list for Digital Twin and 3D Operations View"
---

# Tasks: Digital Twin and 3D Operations View

**Input**: Design documents from `/specs/003-digital-twin-3d/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include backend contract, integration, realtime, frontend integration, 3D binding, and quickstart validation coverage for each user story. AI-service tests are out of scope for this phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Story label for story-phase tasks only
- Every task includes an exact file path

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Backend**: `backend/src/`, `backend/tests/`
- **Docs**: `docs/`, `README.md`, `specs/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish phase-3 feature references and remove AI from this validation path.

- [X] T001 Update phase-3 references in AGENTS.md, README.md, and docs/operations-dashboard.md for specs/003-digital-twin-3d/
- [X] T002 [P] Update Digital Twin and 3D phase notes in docs/digital-twin-3d-next-phase.md and docs/ditto-integration.md
- [X] T003 [P] Add local validation notes excluding AI service in specs/003-digital-twin-3d/quickstart.md and infra/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm shared contracts, synchronization state, and projection state before story work.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Define phase-3 Twin synchronization and 3D projection contracts in backend/src/contracts/elevator.ts, frontend/src/store/realtime-store.ts, and frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts
- [X] T005 [P] Verify Ditto environment and readiness settings in backend/src/config/env.ts and backend/src/config/settings.ts
- [X] T006 [P] Harden Twin payload normalization helpers in backend/src/integrations/ditto/ditto-client.ts and backend/src/modules/realtime/event-normalizer.ts
- [X] T007 Implement shared selection-state plumbing in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts
- [X] T008 [P] Add foundational backend tests for Twin mapping and readiness states in backend/tests/integration/ditto-client.integration.test.ts and backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts
- [X] T009 [P] Add foundational frontend tests for 3D projection mapping and shared selection state in frontend/tests/integration/twin3d-binding.test.tsx

**Checkpoint**: Twin synchronization and 3D projection foundation ready.

---

## Phase 3: User Story 1 - Load Current Twin State (Priority: P1) MVP

**Goal**: Operators see current elevator state from the Twin before relying on newly arriving live events.

**Independent Test**: Start backend with a Twin-compatible source, load dashboard, and verify current elevator state or explicit degraded state appears without waiting for a live update.

### Tests for User Story 1

- [X] T010 [P] [US1] Add contract test for scoped elevator listing and bootstrap readiness in backend/tests/contract/elevators.contract.test.ts
- [X] T011 [P] [US1] Add backend integration test for Twin bootstrap completed, partial, empty, and failed states in backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts
- [X] T012 [US1] Add dashboard integration test for bootstrap loading, ready, empty, and degraded states in frontend/tests/integration/elevator-dashboard-live.test.tsx

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement Twin bootstrap snapshot handling in backend/src/modules/elevators/elevator-monitoring.service.ts and backend/src/modules/elevators/elevator-state.repository.ts
- [X] T014 [P] [US1] Align elevator route behavior with building scope and bootstrap readiness in backend/src/api/routes/elevators.routes.ts
- [X] T015 [US1] Wire bootstrap readiness into backend startup and health reporting in backend/src/api/server.ts and backend/src/observability/elevator-monitoring.metrics.ts

**Checkpoint**: Current Twin state loads into the dashboard with explicit readiness status.

---

## Phase 4: User Story 2 - Keep Live Twin Updates Synchronized (Priority: P1)

**Goal**: Accepted Twin live updates reconcile with bootstrapped state and update dashboard projections once and in order.

**Independent Test**: Replay accepted, duplicate, late, and out-of-scope events and verify only accepted state updates reach the dashboard.

### Tests for User Story 2

- [X] T016 [P] [US2] Add backend integration test for bootstrap plus live reconciliation in backend/tests/integration/elevator-monitoring.integration.test.ts
- [X] T017 [P] [US2] Add backend resilience test for duplicate, out-of-order, malformed, and out-of-scope events in backend/tests/integration/elevator-realtime-resilience.test.ts
- [X] T018 [US2] Add frontend realtime update consistency test in frontend/tests/integration/elevator-dashboard-live.test.tsx

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement idempotent live event routing in backend/src/modules/realtime/event-router.ts and backend/src/modules/realtime/publishers/elevator-state.publisher.ts
- [X] T020 [P] [US2] Implement stale and degraded realtime state tracking in backend/src/modules/realtime/session-manager.ts and frontend/src/store/realtime-store.ts
- [X] T021 [US2] Add synchronization logging and metrics in backend/src/observability/logger.ts and backend/src/observability/elevator-monitoring.metrics.ts

**Checkpoint**: Live Twin updates remain consistent with bootstrapped elevator state.

---

## Phase 5: User Story 3 - Inspect Elevators in 3D (Priority: P2)

**Goal**: Operators inspect elevator position and state in a 3D view synchronized with list and detail panels.

**Independent Test**: Load seeded elevator state, select elevators from the list and 3D scene, and verify one shared selected elevator context.

### Tests for User Story 3

- [X] T022 [P] [US3] Add frontend integration test for 3D projection mapping in frontend/tests/integration/twin3d-binding.test.tsx
- [X] T023 [P] [US3] Add frontend resilience test for stale and degraded 3D state in frontend/tests/integration/twin3d-resilience.test.tsx
- [X] T024 [US3] Add operator quickstart flow test for list-detail-3D selection in frontend/tests/e2e/quickstart-flow.spec.ts

### Implementation for User Story 3

- [X] T025 [P] [US3] Implement normalized elevator to 3D projection mapping in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts
- [X] T026 [P] [US3] Implement 3D scene rendering states in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/ElevatorMesh.tsx
- [X] T027 [P] [US3] Implement 3D controls and detail overlay selection behavior in frontend/src/modules/twin3d/components/TwinControls.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [X] T028 [US3] Synchronize list, detail, and 3D selected elevator state in frontend/src/modules/elevator/components/ElevatorList.tsx and frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx

**Checkpoint**: 3D inspection works as an operational projection of normalized Twin state.

---

## Phase 6: User Story 4 - Operate Through Degraded Twin Conditions (Priority: P2)

**Goal**: Operators can safely interpret stale, partial, empty, and degraded Twin conditions without AI service dependency.

**Independent Test**: Interrupt Twin bootstrap or live delivery and verify dashboard and 3D states remain explicit and preserve last accepted state when available.

### Tests for User Story 4

- [X] T029 [P] [US4] Add backend integration test for degraded readiness and last accepted state preservation in backend/tests/integration/realtime-bootstrap.test.ts
- [X] T030 [P] [US4] Add frontend integration test for degraded dashboard and 3D presentation in frontend/tests/integration/twin3d-resilience.test.tsx
- [X] T031 [US4] Add quickstart validation coverage excluding AI service in frontend/tests/e2e/quickstart-flow.spec.ts and specs/003-digital-twin-3d/quickstart.md

### Implementation for User Story 4

- [X] T032 [P] [US4] Implement degraded-state projection in frontend/src/app/App.tsx, frontend/src/modules/elevator/components/ElevatorStatusBadge.tsx, and frontend/src/modules/twin3d/components/TwinScene.tsx
- [X] T033 [P] [US4] Implement backend degraded-state health response in backend/src/api/server.ts and backend/src/modules/elevators/elevator-monitoring.service.ts
- [X] T034 [US4] Document degraded Twin behavior and AI exclusion in docs/operations-dashboard.md and docs/digital-twin-3d-next-phase.md

**Checkpoint**: Degraded Twin behavior is explicit and usable without AI services.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across contracts, docs, and validation.

- [X] T035 [P] Run backend and frontend build/test validation updates in backend/package.json and frontend/package.json
- [X] T036 [P] Refresh contracts to match final Twin and 3D behavior in specs/003-digital-twin-3d/contracts/openapi.yaml, specs/003-digital-twin-3d/contracts/realtime-events.md, and specs/003-digital-twin-3d/contracts/twin-3d-mapping.md
- [X] T037 Harden operational runbook guidance for Twin and 3D failure modes in infra/observability/runbook.md and docs/ditto-integration.md
- [X] T038 Validate Digital Twin and 3D quickstart and mark task completion state in specs/003-digital-twin-3d/quickstart.md and specs/003-digital-twin-3d/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational and forms the MVP.
- **US2 (P1)**: Depends on US1 bootstrap state semantics.
- **US3 (P2)**: Depends on US1 and US2 normalized state and realtime behavior.
- **US4 (P2)**: Depends on US1 and US2 degraded synchronization semantics and strengthens US3 presentation.

### Within Each User Story

- Tests MUST be written before implementation.
- Backend normalization and state updates come before route, realtime, or UI integration.
- 3D projection must be derived from normalized state only.
- Observability and degraded-state handling are required before a story is considered complete.

### Parallel Opportunities

- T002-T003 can run in parallel after T001.
- T005-T009 can run in parallel after T004.
- In US1, T010-T011 and T013-T014 can run in parallel.
- In US2, T016-T017 and T019-T020 can run in parallel.
- In US3, T022-T023 and T025-T027 can run in parallel across 3D slices.
- In US4, T029-T030 and T032-T033 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate Twin bootstrap before adding 3D refinements.

### Incremental Delivery

1. Deliver US1 to make current Twin state visible.
2. Deliver US2 to keep live updates synchronized.
3. Deliver US3 to make the 3D inspection workflow usable.
4. Deliver US4 to harden degraded-state behavior.
5. Finish with contracts, docs, and validation.

## Notes

- Total tasks: 38
- Story task counts: US1 = 6, US2 = 6, US3 = 7, US4 = 6
- MVP scope: Phase 1, Phase 2, and Phase 3 only
- AI service work is intentionally excluded from this phase
