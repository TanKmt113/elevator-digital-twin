---

description: "Task list for Dashboard Hardening and Operational Readiness"
---

# Tasks: Dashboard Hardening and Operational Readiness

**Input**: Design documents from `/specs/002-dashboard-hardening/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include contract, integration, realtime, UI, AI-service, and quickstart validation coverage for each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Story label for story-phase tasks only
- Every task includes an exact file path

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Backend**: `backend/src/`, `backend/tests/`
- **AI service**: `ai-service/app/`, `ai-service/tests/`
- **Docs**: `docs/`, `README.md`, `specs/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish phase-2 feature artifacts, environment keys, and shared documentation anchors.

- [X] T001 Update shared phase references in AGENTS.md, README.md, and docs/operations-dashboard.md for the new hardening feature paths
- [X] T002 [P] Add or update environment examples for Twin and analytics phase-2 settings in backend/README.md, ai-service/README.md, and infra/README.md
- [X] T003 [P] Add dashboard hardening validation notes and Ditto references in docs/ditto-integration.md and specs/002-dashboard-hardening/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared synchronization, presentation-state, and validation scaffolding required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Define phase-2 synchronization and validation state contracts in backend/src/contracts/elevator.ts, backend/src/contracts/risk.ts, and frontend/src/store/realtime-store.ts
- [X] T005 [P] Extend backend environment and readiness configuration for Twin bootstrap and live synchronization in backend/src/config/env.ts and backend/src/config/settings.ts
- [X] T006 [P] Add shared Twin bootstrap mapping and normalization helpers in backend/src/integrations/ditto/ditto-client.ts and backend/src/modules/realtime/event-normalizer.ts
- [X] T007 Implement synchronization-state tracking and stale/degraded readiness plumbing in backend/src/modules/elevators/elevator-monitoring.service.ts, backend/src/modules/realtime/session-manager.ts, and backend/src/observability/elevator-monitoring.metrics.ts
- [X] T008 [P] Add foundational backend tests for Twin bootstrap mapping and readiness state in backend/tests/integration/ditto-client.integration.test.ts and backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts
- [X] T009 [P] Add foundational frontend tests for loading, empty, and degraded app-shell states in frontend/tests/integration/app-shell.test.ts and frontend/src/app/App.tsx

**Checkpoint**: Synchronization foundation ready. User stories can now be completed independently.

---

## Phase 3: User Story 1 - Keep Elevator State Faithful to the Operational Twin (Priority: P1) 🎯 MVP

**Goal**: Ensure the backend bootstraps current elevator state from the Twin and keeps it synchronized with live updates under normal and degraded conditions.

**Independent Test**: Start the backend with a Twin-compatible source, hydrate current state, replay live updates, and verify consistent normalized state plus explicit degraded signaling without frontend refresh hacks.

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Add contract test for scoped elevator listing and readiness behavior in backend/tests/contract/elevators.contract.test.ts
- [X] T011 [P] [US1] Add backend integration test for bootstrap plus live reconciliation in backend/tests/integration/elevator-monitoring.integration.test.ts
- [X] T012 [P] [US1] Add backend integration test for duplicate, out-of-order, and unknown-elevator live events in backend/tests/integration/elevator-realtime-resilience.test.ts
- [X] T013 [US1] Add backend integration test for server startup bootstrap behavior in backend/tests/integration/realtime-bootstrap.test.ts

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement Twin bootstrap snapshot and reconciliation logic in backend/src/modules/elevators/elevator-monitoring.service.ts and backend/src/modules/elevators/elevator-state.repository.ts
- [X] T015 [P] [US1] Implement live Twin event routing and idempotent acceptance rules in backend/src/modules/realtime/event-router.ts and backend/src/modules/realtime/publishers/elevator-state.publisher.ts
- [X] T016 [US1] Wire Ditto bootstrap and live synchronization into backend startup in backend/src/api/server.ts and backend/src/integrations/ditto/ditto-client.ts
- [X] T017 [US1] Align elevator query behavior with building scope and readiness semantics in backend/src/api/routes/elevators.routes.ts
- [X] T018 [US1] Add synchronization observability, failure logging, and health reporting in backend/src/observability/logger.ts and backend/src/api/server.ts

**Checkpoint**: The platform can bootstrap and maintain authoritative elevator state from the Twin with degraded-state handling.

---

## Phase 4: User Story 2 - Use an Operator-Grade Dashboard During Active Monitoring (Priority: P1)

**Goal**: Transform the current functional scaffold into a coherent operations dashboard with strong hierarchy, responsive layout, and explicit empty/loading/degraded states.

**Independent Test**: Seed dashboard data, perform the primary operator monitoring flow on desktop and tablet widths, and confirm panel layout, visual emphasis, and state handling remain usable and consistent.

### Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] Add frontend integration test for dashboard loading, empty, and degraded rendering in frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T020 [P] [US2] Add frontend integration test for cross-panel selection and status consistency in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/alert-panel.test.tsx
- [X] T021 [P] [US2] Add frontend end-to-end test for operator monitoring workflow layout in frontend/tests/e2e/quickstart-flow.spec.ts
- [X] T022 [US2] Add frontend resilience test for degraded dashboard presentation state in frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 2

- [X] T023 [P] [US2] Implement shared dashboard layout and visual tokens in frontend/src/app/App.tsx, frontend/src/main.tsx, and frontend/src/styles.css
- [X] T024 [P] [US2] Implement operator-grade summary, list, and detail presentation in frontend/src/modules/elevator/components/ElevatorSummaryCards.tsx, frontend/src/modules/elevator/components/ElevatorList.tsx, and frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx
- [X] T025 [P] [US2] Implement alert and risk panel layout, empty states, and severity emphasis in frontend/src/modules/alerts/components/AlertPanel.tsx, frontend/src/modules/alerts/components/AlertDetailDrawer.tsx, and frontend/src/modules/analytics/components/RiskWarningPanel.tsx
- [X] T026 [P] [US2] Implement synchronized dashboard/Twin-view presentation states in frontend/src/modules/twin3d/components/TwinScene.tsx, frontend/src/modules/twin3d/components/TwinControls.tsx, and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [X] T027 [US2] Implement frontend realtime loading, empty, stale, and degraded projection state handling in frontend/src/store/realtime-store.ts, frontend/src/store/elevator-store.ts, and frontend/src/modules/elevator/components/ElevatorStatusBadge.tsx

**Checkpoint**: Operators can use a coherent dashboard UI for the core monitoring workflow under normal and degraded states.

---

## Phase 5: User Story 3 - Validate Analytics and Release Readiness End-to-End (Priority: P2)

**Goal**: Verify that analytics warnings, quickstart flows, and multi-service validation steps work together as one documented platform slice.

**Independent Test**: Run the documented quickstart, validate predictive warning flow against curated telemetry, and confirm the dashboard and backend surface the expected operator-visible outcomes and failure signals.

### Tests for User Story 3 ⚠️

- [X] T028 [P] [US3] Add AI-service validation test coverage for end-to-end predictive warning preparation in ai-service/tests/test_risk_pipeline.py and ai-service/tests/conftest.py
- [X] T029 [P] [US3] Add backend integration test for analytics ingestion readiness and model traceability in backend/tests/integration/risk-warning.integration.test.ts
- [X] T030 [P] [US3] Add frontend integration test for predictive warning metadata rendering in frontend/tests/integration/risk-warning-panel.test.tsx
- [X] T031 [US3] Add quickstart validation coverage for full phase-2 bring-up in frontend/tests/e2e/quickstart-flow.spec.ts and specs/002-dashboard-hardening/quickstart.md

### Implementation for User Story 3

- [X] T032 [P] [US3] Implement analytics validation and model-trace fields in ai-service/app/services/predictive_maintenance_service.py, ai-service/app/services/model_registry.py, and ai-service/app/api/risk.py
- [X] T033 [P] [US3] Implement backend risk-ingestion validation and readiness reporting in backend/src/modules/analytics/risk-analytics.service.ts, backend/src/api/routes/analytics.routes.ts, and backend/src/observability/risk.metrics.ts
- [X] T034 [P] [US3] Implement frontend predictive warning metadata and verification states in frontend/src/store/risk-store.ts and frontend/src/modules/analytics/components/RiskWarningPanel.tsx
- [X] T035 [US3] Document end-to-end bring-up, validation, and degraded-service expectations in README.md, docs/operations-dashboard.md, and ai-service/README.md

**Checkpoint**: Predictive warnings and local bring-up are validated as one coherent multi-service flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across synchronization, UI, analytics, and documentation.

- [X] T036 [P] Run cross-service build and test validation updates in frontend/package.json, backend/package.json, and ai-service/pyproject.toml
- [X] T037 Harden observability and operational runbook guidance for phase-2 failure modes in infra/observability/runbook.md and docs/ditto-integration.md
- [X] T038 [P] Refresh contracts and docs to match final runtime behavior in specs/002-dashboard-hardening/contracts/openapi.yaml and specs/002-dashboard-hardening/contracts/realtime-events.md
- [X] T039 Validate phase-2 quickstart and mark task completion state in specs/002-dashboard-hardening/quickstart.md and specs/002-dashboard-hardening/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on the completion of the targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational and forms the MVP of phase 2.
- **US2 (P1)**: Depends on US1 synchronization semantics and shared frontend state readiness.
- **US3 (P2)**: Depends on US1 backend readiness and uses the polished dashboard surfaces from US2 for final operator-visible validation.

### Within Each User Story

- Tests MUST be written and fail before implementation.
- Normalization and shared state updates come before route or UI integration.
- Observability and degraded-state handling are required before a story is considered complete.

### Parallel Opportunities

- T002-T003 can run in parallel after T001.
- T005-T009 can run in parallel after T004 sets the shared contract direction.
- In US1, T010-T012 and T014-T015 can run in parallel.
- In US2, T019-T021 and T023-T026 can run in parallel across frontend slices.
- In US3, T028-T030 and T032-T034 can run in parallel across AI, backend, and frontend.

---

## Parallel Example: User Story 2

```bash
# Launch user-facing tests together:
Task: "T019 Dashboard loading, empty, and degraded rendering in frontend/tests/integration/elevator-dashboard-live.test.tsx"
Task: "T020 Cross-panel selection and status consistency in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/alert-panel.test.tsx"
Task: "T021 Operator monitoring workflow layout in frontend/tests/e2e/quickstart-flow.spec.ts"

# Launch UI slices together:
Task: "T024 Operator-grade summary, list, and detail presentation in frontend/src/modules/elevator/components/ElevatorSummaryCards.tsx, frontend/src/modules/elevator/components/ElevatorList.tsx, and frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx"
Task: "T025 Alert and risk panel layout in frontend/src/modules/alerts/components/AlertPanel.tsx, frontend/src/modules/alerts/components/AlertDetailDrawer.tsx, and frontend/src/modules/analytics/components/RiskWarningPanel.tsx"
Task: "T026 Synchronized dashboard/Twin-view presentation in frontend/src/modules/twin3d/components/TwinScene.tsx, frontend/src/modules/twin3d/components/TwinControls.tsx, and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate Twin bootstrap and live reconciliation before polishing the UI.

### Incremental Delivery

1. Deliver US1 to make current elevator state authoritative at startup and during live operation.
2. Add US2 to bring the operator dashboard up to production-usable quality.
3. Add US3 to validate analytics and documented release-readiness paths.
4. Finish with cross-cutting polish and quickstart validation.

### Parallel Team Strategy

1. One engineer completes Foundational synchronization and readiness work.
2. Then split by capability:
   - Developer A: US1 backend synchronization
   - Developer B: US2 frontend dashboard polish
   - Developer C: US3 AI and end-to-end validation
3. Rejoin for the final phase to reconcile docs, observability, and quickstart validation.

## Notes

- Total tasks: 39
- Story task counts: US1 = 9, US2 = 9, US3 = 8
- MVP scope: Phase 1, Phase 2, and Phase 3 (US1) only
- All tasks follow the required checklist format with checkbox, ID, optional `[P]`, story label where needed, and exact file paths
