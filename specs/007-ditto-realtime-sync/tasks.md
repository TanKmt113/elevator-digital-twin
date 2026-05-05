---

description: "Task list for Ditto Realtime Synchronization"

---

# Tasks: Ditto Realtime Synchronization

**Input**: Design documents from `/specs/007-ditto-realtime-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include backend contract and integration coverage, frontend integration coverage, realtime flow validation, and interruption or recovery validation for this feature.

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

**Purpose**: Prepare feature-local documentation anchors, validation entry points, and realtime environment references.

- [ ] T001 Update feature-007 references in AGENTS.md, README.md, and docs/operations-dashboard.md to point at specs/007-ditto-realtime-sync/
- [ ] T002 [P] Add feature-007 validation script entries and realtime environment notes in backend/package.json, frontend/package.json, backend/README.md, and frontend/README.md
- [ ] T003 [P] Add local Ditto live replay references for feature-007 in infra/README.md and docs/ditto-integration.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared contracts, health model, authorization boundaries, and observability required before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define or extend versioned realtime synchronization contracts in backend/src/contracts/elevator.ts and frontend/src/store/realtime-store.ts
- [ ] T005 [P] Add shared normalized live event and resync contract coverage in backend/tests/integration/realtime-bootstrap.test.ts and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [ ] T006 [P] Extend backend environment and reconnect defaults for live ingestion and browser delivery in backend/src/config/env.ts and backend/src/config/settings.ts
- [ ] T007 [P] Implement or refine building-scope authorization helpers for realtime delivery in backend/src/modules/auth/rbac.ts and backend/src/modules/auth/auth.middleware.ts
- [ ] T008 Add structured logs, rejection counters, and synchronization metrics foundations in backend/src/observability/logger.ts and backend/src/observability/elevator-monitoring.metrics.ts
- [ ] T009 Refresh feature-007 browser event contracts in specs/007-ditto-realtime-sync/contracts/realtime-events.md and specs/007-ditto-realtime-sync/contracts/resync-sequence.md after foundational decisions

**Checkpoint**: Shared realtime contracts, auth scope, and observability foundation are ready.

---

## Phase 3: User Story 1 - Reflect Live Twin Changes In The Dashboard (Priority: P1) 🎯 MVP

**Goal**: Accepted Ditto changes automatically propagate into summary, list, detail, and 3D views without page reload.

**Independent Test**: Start the local stack, load the dashboard once, change an in-scope elevator state in Ditto, and confirm all dashboard surfaces update automatically.

### Tests for User Story 1 ⚠️

- [ ] T010 [P] [US1] Add backend Ditto live ingestion integration test for accepted elevator updates in backend/tests/integration/ditto-client.integration.test.ts
- [ ] T011 [P] [US1] Add backend publication integration test for accepted elevator updates reaching realtime sessions in backend/tests/integration/realtime-bootstrap.test.ts
- [ ] T012 [P] [US1] Add frontend integration test for applying accepted `elevator.state.changed` updates across dashboard surfaces in frontend/tests/integration/elevator-dashboard-live.test.tsx
- [ ] T013 [US1] Add feature-007 quickstart validation test notes and manual acceptance steps in specs/007-ditto-realtime-sync/quickstart.md

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement Ditto live consumer adapter with normalized event subscription in backend/src/integrations/ditto/ditto-live-consumer.ts
- [ ] T015 [P] [US1] Extend Ditto client live parsing and projection helpers in backend/src/integrations/ditto/ditto-client.ts and backend/src/modules/realtime/event-normalizer.ts
- [X] T016 [US1] Integrate accepted live state mutation into backend materialized state in backend/src/modules/elevators/elevator-monitoring.service.ts and backend/src/modules/elevators/elevator-state.repository.ts
- [X] T017 [US1] Implement backend realtime publication flow for accepted elevator changes in backend/src/modules/realtime/publishers/elevator-state.publisher.ts and backend/src/api/server.ts
- [X] T018 [P] [US1] Implement browser realtime transport client in frontend/src/services/realtime/ws-client.ts and frontend/src/services/realtime/elevator-events.ts
- [X] T019 [US1] Wire frontend live update startup and store application in frontend/src/app/App.tsx, frontend/src/store/realtime-store.ts, and frontend/src/store/elevator-store.ts
- [ ] T020 [US1] Confirm 3D and dashboard projections consume the same accepted live state in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/hooks/useTwinSelection.ts

**Checkpoint**: Accepted Ditto changes update the dashboard automatically end-to-end.

---

## Phase 4: User Story 2 - Reject Invalid Or Irrelevant Live Events Safely (Priority: P1)

**Goal**: Duplicate, late, malformed, and out-of-scope live changes never create misleading dashboard transitions.

**Independent Test**: Replay valid, duplicate, out-of-order, malformed, and out-of-scope Twin changes and confirm only accepted events mutate visible dashboard state.

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Add backend rejection-path integration tests for duplicate, late, malformed, and out-of-scope Twin changes in backend/tests/integration/elevator-monitoring.integration.test.ts
- [ ] T022 [P] [US2] Add backend scope and envelope contract coverage for rejected-event counters in backend/tests/contract/elevators.contract.test.ts
- [ ] T023 [P] [US2] Add frontend integration test ensuring rejected live changes do not regress visible dashboard state in frontend/tests/integration/twin3d-resilience.test.tsx and frontend/tests/integration/elevator-dashboard-live.test.tsx

### Implementation for User Story 2

- [X] T024 [P] [US2] Extend live event routing and rejection accounting in backend/src/modules/realtime/event-router.ts and backend/src/contracts/elevator.ts
- [ ] T025 [US2] Harden malformed payload normalization and rejection semantics in backend/src/modules/realtime/event-normalizer.ts and backend/src/integrations/ditto/ditto-client.ts
- [ ] T026 [US2] Enforce building-scope filtering before realtime publication in backend/src/modules/realtime/ws-server.ts and backend/src/modules/auth/auth.middleware.ts
- [ ] T027 [US2] Publish synchronization-state updates for rejected-event visibility in backend/src/api/server.ts and backend/src/observability/elevator-monitoring.metrics.ts
- [ ] T028 [US2] Apply idempotent live-event handling and rejection-safe store updates in frontend/src/services/realtime/elevator-events.ts and frontend/src/store/realtime-store.ts

**Checkpoint**: Rejected Twin changes are observable but never produce false dashboard transitions.

---

## Phase 5: User Story 3 - Recover Cleanly From Realtime Interruptions (Priority: P2)

**Goal**: The dashboard exposes stale or degraded state quickly and resynchronizes cleanly after reconnect without losing valid operator context.

**Independent Test**: Interrupt live delivery while the dashboard is open, restore connectivity, and confirm stale status, resync, and recovery behavior without page reload.

### Tests for User Story 3 ⚠️

- [ ] T029 [P] [US3] Add backend reconnect and resync integration coverage in backend/tests/integration/elevator-realtime-resilience.test.ts and backend/tests/integration/realtime-bootstrap.test.ts
- [ ] T030 [P] [US3] Add frontend reconnect, stale, and resync integration coverage in frontend/tests/integration/app-shell.test.ts and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [ ] T031 [US3] Add 3D selection continuity and degraded-state regression coverage during resync in frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implement backend realtime session lifecycle and reconnect tracking in backend/src/modules/realtime/ws-server.ts and backend/src/modules/realtime/session-manager.ts
- [ ] T033 [P] [US3] Add backend synchronization-state and resync-required publication in backend/src/api/server.ts and backend/src/modules/realtime/publishers/elevator-state.publisher.ts
- [ ] T034 [US3] Implement frontend reconnect handling and controlled resync flow in frontend/src/services/realtime/ws-client.ts, frontend/src/services/api/client.ts, and frontend/src/services/realtime/elevator-events.ts
- [ ] T035 [US3] Wire stale, resyncing, and degraded state presentation into frontend runtime stores and app shell in frontend/src/store/realtime-store.ts and frontend/src/app/App.tsx
- [ ] T036 [US3] Preserve selected elevator context across reconnect and resync in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts

**Checkpoint**: Delivery interruption and recovery are explicit, stable, and operator-safe.

---

## Phase 6: User Story 4 - Validate Realtime Flow In Local Development (Priority: P2)

**Goal**: Developers can prove accepted live propagation, rejected-event handling, and recovery behavior from a repeatable local runbook.

**Independent Test**: Follow the quickstart from a clean startup, trigger Ditto changes, open multiple sessions, simulate interruption, and confirm the documented outputs.

### Tests for User Story 4 ⚠️

- [ ] T037 [P] [US4] Add local live replay validation coverage in backend/tests/integration/ditto-client.integration.test.ts and backend/tests/integration/elevator-realtime-resilience.test.ts
- [ ] T038 [P] [US4] Add frontend multi-session and local recovery validation coverage in frontend/tests/integration/elevator-dashboard-live.test.tsx

### Implementation for User Story 4

- [ ] T039 [P] [US4] Add or refresh local Ditto replay fixtures and helper scripts in infra/ditto/replay-events.json and infra/ditto/replay-ditto-event.ts
- [ ] T040 [P] [US4] Expose local health and troubleshooting signals for live synchronization in backend/src/api/server.ts and infra/observability/runbook.md
- [ ] T041 [US4] Finalize local validation steps, expected outputs, and failure interpretation in specs/007-ditto-realtime-sync/quickstart.md and docs/ditto-integration.md
- [ ] T042 [US4] Surface operator-visible local readiness and degraded hints in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx

**Checkpoint**: Local developers can validate realtime behavior end-to-end from documentation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, validation, and release-readiness across all stories.

- [ ] T043 [P] Refresh final feature-007 contracts and plan references in specs/007-ditto-realtime-sync/contracts/realtime-events.md, specs/007-ditto-realtime-sync/contracts/resync-sequence.md, and specs/007-ditto-realtime-sync/plan.md
- [ ] T044 [P] Run and document backend validation for feature-007 in backend/package.json and specs/007-ditto-realtime-sync/quickstart.md
- [ ] T045 [P] Run and document frontend validation for feature-007 in frontend/package.json and specs/007-ditto-realtime-sync/quickstart.md
- [ ] T046 Harden operational troubleshooting and delivery notes in docs/operations-dashboard.md and infra/observability/runbook.md
- [ ] T047 Validate that no frontend code connects directly to Ditto and that no polling fallback was introduced in frontend/src/ and backend/src/
- [ ] T048 Mark implementation completion state in specs/007-ditto-realtime-sync/tasks.md after all validation passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on completion of the targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and is the MVP. It establishes real Ditto-to-dashboard live propagation.
- **US2 (P1)**: Starts after Foundational and builds directly on US1 publication paths to enforce safe rejection semantics.
- **US3 (P2)**: Starts after Foundational and depends on US1 live delivery plus US2 synchronization health semantics for robust reconnect or resync behavior.
- **US4 (P2)**: Depends on US1-US3 so the local validation flow can cover accepted propagation, rejected events, and recovery.

### Within Each User Story

- Tests MUST be written before implementation.
- Contract and normalization work come before transport publication.
- Backend ingestion and publication come before frontend live application.
- Realtime recovery and presentation changes come after core delivery paths exist.
- Each story should be independently testable before moving to the next delivery goal.

### Parallel Opportunities

- T002-T003 can run in parallel after T001.
- T005-T007 can run in parallel during Foundational once T004 is understood.
- In US1, T010-T012 and T014-T015/T018 can run in parallel across backend and frontend slices.
- In US2, T021-T023 and T024-T026 can run in parallel across rejection logic and UI safety validation.
- In US3, T029-T031 and T032-T034 can run in parallel across reconnect handling in backend and frontend.
- In US4, T037-T040 can run in parallel across replay tooling, health, and validation support.

---

## Parallel Example: User Story 1

```bash
# Tests for accepted live propagation:
Task: "T010 [US1] backend Ditto live ingestion integration test in backend/tests/integration/ditto-client.integration.test.ts"
Task: "T011 [US1] backend publication integration test in backend/tests/integration/realtime-bootstrap.test.ts"
Task: "T012 [US1] frontend live update integration test in frontend/tests/integration/elevator-dashboard-live.test.tsx"

# Implementation split by layer:
Task: "T014 [US1] Ditto live consumer adapter in backend/src/integrations/ditto/ditto-live-consumer.ts"
Task: "T017 [US1] backend realtime publication flow in backend/src/modules/realtime/publishers/elevator-state.publisher.ts and backend/src/api/server.ts"
Task: "T018 [US1] browser realtime transport client in frontend/src/services/realtime/ws-client.ts and frontend/src/services/realtime/elevator-events.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T021 [US2] backend rejection-path integration tests in backend/tests/integration/elevator-monitoring.integration.test.ts"
Task: "T024 [US2] live event routing and rejection accounting in backend/src/modules/realtime/event-router.ts and backend/src/contracts/elevator.ts"
Task: "T028 [US2] rejection-safe frontend store updates in frontend/src/services/realtime/elevator-events.ts and frontend/src/store/realtime-store.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] backend reconnect and resync integration coverage in backend/tests/integration/elevator-realtime-resilience.test.ts"
Task: "T032 [US3] backend realtime session lifecycle in backend/src/modules/realtime/ws-server.ts and backend/src/modules/realtime/session-manager.ts"
Task: "T034 [US3] frontend reconnect and controlled resync flow in frontend/src/services/realtime/ws-client.ts and frontend/src/services/api/client.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate automatic Ditto-to-dashboard propagation before expanding scope.

### Incremental Delivery

1. Deliver US1 so accepted Ditto changes update the dashboard without reload.
2. Deliver US2 so invalid or irrelevant changes are rejected safely.
3. Deliver US3 so interruption and recovery behavior become operator-safe.
4. Deliver US4 so local validation is repeatable and diagnosable.
5. Finish with validation, contract refresh, and operational polish.
