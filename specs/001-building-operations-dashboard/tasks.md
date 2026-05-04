---

description: "Task list for Smart Building Operations Dashboard implementation"
---

# Tasks: Smart Building Operations Dashboard

**Input**: Design documents from `/specs/001-building-operations-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include contract, integration, realtime, UI, and failure-mode coverage for each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: User story label for story-phase tasks only
- Every task includes an exact file path

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Backend**: `backend/src/`, `backend/tests/`
- **AI service**: `ai-service/app/`, `ai-service/tests/`
- **Infra**: `infra/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the monorepo structure, toolchains, and local infrastructure scaffolding.

- [X] T001 Create monorepo workspace structure in frontend/, backend/, ai-service/, and infra/ with baseline README files
- [X] T002 Initialize frontend package configuration in frontend/package.json and frontend/tsconfig.json
- [X] T003 [P] Initialize backend package configuration in backend/package.json and backend/tsconfig.json
- [X] T004 [P] Initialize AI service package configuration in ai-service/pyproject.toml and ai-service/requirements.txt
- [X] T005 [P] Add shared linting and formatting configuration in frontend/eslint.config.js, frontend/prettier.config.cjs, backend/eslint.config.js, and backend/prettier.config.cjs
- [X] T006 [P] Add local infrastructure bootstrap files in infra/docker/docker-compose.yml and infra/docker/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core contracts, auth, persistence, observability, and realtime plumbing required by every story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Define normalized elevator, alert, command, and risk schemas in backend/src/contracts/elevator.ts, backend/src/contracts/alert.ts, backend/src/contracts/command.ts, and backend/src/contracts/risk.ts
- [X] T008 [P] Implement backend configuration and secret loading in backend/src/config/env.ts and backend/src/config/settings.ts
- [X] T009 [P] Implement JWT authentication and role-scope authorization middleware in backend/src/modules/auth/auth.middleware.ts and backend/src/modules/auth/rbac.ts
- [X] T010 [P] Implement Ditto subscription client and MQTT ingress adapters in backend/src/integrations/ditto/ditto-client.ts and backend/src/integrations/mqtt/mqtt-consumer.ts
- [X] T011 Implement event normalization and deduplication pipeline in backend/src/modules/realtime/event-normalizer.ts and backend/src/modules/realtime/event-router.ts
- [X] T012 [P] Implement shared persistence clients for MongoDB, TimescaleDB, and Redis in backend/src/integrations/persistence/mongo.ts, backend/src/integrations/persistence/timescale.ts, and backend/src/integrations/redis/redis-client.ts
- [X] T013 [P] Implement structured logging, metrics, and trace correlation bootstrap in backend/src/observability/logger.ts, backend/src/observability/metrics.ts, and backend/src/observability/tracing.ts
- [X] T014 Implement backend API bootstrap, WebSocket session manager, and reconnect or stale-state policies in backend/src/api/server.ts, backend/src/modules/realtime/ws-server.ts, and backend/src/modules/realtime/session-manager.ts
- [X] T015 [P] Implement frontend app shell, auth session store, and shared realtime state store bootstrap in frontend/src/app/App.tsx, frontend/src/store/session-store.ts, and frontend/src/store/realtime-store.ts
- [X] T016 [P] Implement frontend API and WebSocket clients in frontend/src/services/api/client.ts and frontend/src/services/realtime/ws-client.ts
- [X] T017 [P] Add foundational contract, auth, and realtime infrastructure tests in backend/tests/contract/auth.contract.test.ts, backend/tests/integration/realtime-bootstrap.test.ts, and frontend/tests/integration/app-shell.test.ts

**Checkpoint**: Foundation ready. User stories can now be implemented independently.

---

## Phase 3: User Story 1 - Monitor Elevators in Real Time (Priority: P1) 🎯 MVP

**Goal**: Give operators a live dashboard showing elevator status, floor, direction, door state, load, and fault visibility without reload.

**Independent Test**: Publish simulated elevator state events and verify the dashboard summary, list, and detail views update live, mark stale assets correctly, and show faulted elevators distinctly.

### Tests for User Story 1 ⚠️

- [X] T018 [P] [US1] Add contract test for GET /elevators and GET /elevators/{elevatorId} in backend/tests/contract/elevators.contract.test.ts
- [X] T019 [P] [US1] Add backend integration test for Ditto event normalization to elevator summaries in backend/tests/integration/elevator-monitoring.integration.test.ts
- [X] T020 [P] [US1] Add frontend integration test for dashboard live updates in frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T021 [US1] Add realtime failure-mode test for duplicate, delayed, and stale elevator events in backend/tests/integration/elevator-realtime-resilience.test.ts

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement elevator twin and elevator event domain models in backend/src/modules/elevators/elevator-twin.model.ts and backend/src/modules/elevators/elevator-event.model.ts
- [X] T023 [P] [US1] Implement historical event ingestion repository for live monitoring state snapshots in backend/src/modules/elevators/elevator-state.repository.ts
- [X] T024 [US1] Implement elevator monitoring service in backend/src/modules/elevators/elevator-monitoring.service.ts
- [X] T025 [US1] Implement elevator query API routes in backend/src/api/routes/elevators.routes.ts
- [X] T026 [US1] Implement elevator realtime publisher in backend/src/modules/realtime/publishers/elevator-state.publisher.ts
- [X] T027 [P] [US1] Implement elevator store slice and selectors in frontend/src/store/elevator-store.ts and frontend/src/store/selectors/elevator-selectors.ts
- [X] T028 [P] [US1] Implement elevator dashboard list and summary cards in frontend/src/modules/elevator/components/ElevatorSummaryCards.tsx and frontend/src/modules/elevator/components/ElevatorList.tsx
- [X] T029 [US1] Implement elevator detail panel in frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx
- [X] T030 [US1] Wire WebSocket elevator events into Zustand state without UI-side business logic in frontend/src/services/realtime/elevator-events.ts
- [X] T031 [US1] Add stale-state indicators, offline handling, and monitoring metrics in frontend/src/modules/elevator/components/ElevatorStatusBadge.tsx and backend/src/observability/elevator-monitoring.metrics.ts

**Checkpoint**: User Story 1 is independently functional and demo-ready as the MVP slice.

---

## Phase 4: User Story 2 - Issue Safe Elevator Commands (Priority: P1)

**Goal**: Let authorized operators submit move, stop, and reset commands with immediate acknowledgement and policy enforcement.

**Independent Test**: Submit valid and invalid commands for selected elevators and verify acknowledgement timing, rejection messaging, audit records, and downstream status updates.

### Tests for User Story 2 ⚠️

- [ ] T032 [P] [US2] Add contract test for POST /commands in backend/tests/contract/commands.contract.test.ts
- [ ] T033 [P] [US2] Add backend integration test for command validation and lifecycle transitions in backend/tests/integration/command-lifecycle.integration.test.ts
- [ ] T034 [P] [US2] Add frontend integration test for command submission and acknowledgement rendering in frontend/tests/integration/elevator-commands.test.tsx
- [ ] T035 [US2] Add resilience test for downstream command failure and policy rejection handling in backend/tests/integration/command-failure.integration.test.ts

### Implementation for User Story 2

- [ ] T036 [P] [US2] Implement control command domain model and audit record mapping in backend/src/modules/elevators/control-command.model.ts and backend/src/modules/elevators/command-audit.model.ts
- [ ] T037 [US2] Implement command policy and authorization service in backend/src/modules/elevators/command-policy.service.ts
- [ ] T038 [US2] Implement command execution orchestration and downstream correlation handling in backend/src/modules/elevators/command-execution.service.ts
- [ ] T039 [US2] Implement commands API route in backend/src/api/routes/commands.routes.ts
- [ ] T040 [US2] Implement command status realtime publisher in backend/src/modules/realtime/publishers/command-status.publisher.ts
- [ ] T041 [P] [US2] Implement frontend command action panel in frontend/src/modules/elevator/components/ElevatorCommandPanel.tsx
- [ ] T042 [US2] Implement frontend command mutation and optimistic acknowledgement state in frontend/src/modules/elevator/services/submit-command.ts and frontend/src/store/command-store.ts
- [ ] T043 [US2] Add command audit logging and command outcome metrics in backend/src/observability/command.metrics.ts and backend/src/modules/elevators/command-audit.repository.ts

**Checkpoint**: User Stories 1 and 2 both work independently, and operators can monitor and issue safe commands.

---

## Phase 5: User Story 4 - Respond to Alerts Quickly (Priority: P1)

**Goal**: Surface realtime alerts with severity, acknowledgement flow, and synchronized operator visibility.

**Independent Test**: Emit supported alert scenarios and verify operators and maintenance users receive, filter, inspect, and acknowledge alerts with audit visibility.

### Tests for User Story 4 ⚠️

- [ ] T044 [P] [US4] Add contract tests for GET /alerts and POST /alerts/{alertId}/acknowledge in backend/tests/contract/alerts.contract.test.ts
- [ ] T045 [P] [US4] Add backend integration test for alert rule mapping and acknowledgement workflow in backend/tests/integration/alerts.integration.test.ts
- [ ] T046 [P] [US4] Add frontend integration test for alert panel filtering and acknowledgement in frontend/tests/integration/alert-panel.test.tsx
- [ ] T047 [US4] Add realtime failure-mode test for duplicated and out-of-scope alert events in backend/tests/integration/alert-resilience.integration.test.ts

### Implementation for User Story 4

- [ ] T048 [P] [US4] Implement alert domain model and repository in backend/src/modules/alerts/alert.model.ts and backend/src/modules/alerts/alert.repository.ts
- [ ] T049 [US4] Implement alert rule engine and severity mapping service in backend/src/modules/alerts/alert-rule.service.ts
- [ ] T050 [US4] Implement alerts query and acknowledgement service in backend/src/modules/alerts/alerts.service.ts
- [ ] T051 [US4] Implement alerts API routes in backend/src/api/routes/alerts.routes.ts
- [ ] T052 [US4] Implement alert realtime publishers in backend/src/modules/realtime/publishers/alert.publisher.ts
- [ ] T053 [P] [US4] Implement frontend alert store and filter state in frontend/src/store/alert-store.ts and frontend/src/modules/alerts/hooks/useAlertFilters.ts
- [ ] T054 [P] [US4] Implement alert panel and alert detail UI in frontend/src/modules/alerts/components/AlertPanel.tsx and frontend/src/modules/alerts/components/AlertDetailDrawer.tsx
- [ ] T055 [US4] Add alert acknowledgement audit logging and alert latency metrics in backend/src/observability/alert.metrics.ts and backend/src/modules/alerts/alert-audit.repository.ts

**Checkpoint**: User Stories 1, 2, and 4 provide a complete core operations workflow for live monitoring, command execution, and incident response.

---

## Phase 6: User Story 3 - Understand Building State Through 3D Twin View (Priority: P2)

**Goal**: Show elevator positions and status spatially in a 3D twin view with selection and hover interactions.

**Independent Test**: Open the 3D view during live event playback and verify object position, color, highlight, and detail panel synchronization with the dashboard state.

### Tests for User Story 3 ⚠️

- [ ] T056 [P] [US3] Add frontend integration test for 3D object binding and selection state in frontend/tests/integration/twin3d-binding.test.tsx
- [ ] T057 [P] [US3] Add frontend UI test for hover and detail panel interactions in frontend/tests/e2e/twin3d-interaction.spec.ts
- [ ] T058 [US3] Add realtime resilience test for degraded 3D state updates in frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 3

- [ ] T059 [P] [US3] Implement 3D mapping configuration model and repository in backend/src/modules/elevators/twin3d-mapping.model.ts and backend/src/modules/elevators/twin3d-mapping.repository.ts
- [ ] T060 [US3] Implement frontend 3D asset state adapter in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts
- [ ] T061 [P] [US3] Implement React Three Fiber scene and camera controls in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/TwinControls.tsx
- [ ] T062 [P] [US3] Implement elevator mesh binding and status coloring in frontend/src/modules/twin3d/components/ElevatorMesh.tsx
- [ ] T063 [US3] Implement hover, selection, and detail synchronization in frontend/src/modules/twin3d/hooks/useTwinSelection.ts and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [ ] T064 [US3] Add 3D rendering performance instrumentation in frontend/src/modules/twin3d/services/twin3d-performance.ts

**Checkpoint**: User Story 3 is independently usable with live spatial visualization layered onto the operational dashboard.

---

## Phase 7: User Story 5 - Review History and Operational Trends (Priority: P2)

**Goal**: Let admins and maintenance users query and review historical movements, activity counts, and alert history.

**Independent Test**: Request history for selected elevators and time windows, validate returned records and empty states, and confirm filters work without affecting live monitoring.

### Tests for User Story 5 ⚠️

- [ ] T065 [P] [US5] Add contract test for GET /elevators/{elevatorId}/history in backend/tests/contract/elevator-history.contract.test.ts
- [ ] T066 [P] [US5] Add backend integration test for time-range history queries in backend/tests/integration/elevator-history.integration.test.ts
- [ ] T067 [P] [US5] Add frontend integration test for history filters and result states in frontend/tests/integration/elevator-history-panel.test.tsx
- [ ] T068 [US5] Add failure-mode test for partial historical data windows in backend/tests/integration/elevator-history-partial-data.test.ts

### Implementation for User Story 5

- [ ] T069 [P] [US5] Implement historical telemetry repository in backend/src/modules/elevators/historical-telemetry.repository.ts
- [ ] T070 [P] [US5] Implement historical query service in backend/src/modules/elevators/elevator-history.service.ts
- [ ] T071 [US5] Implement elevator history API route in backend/src/api/routes/elevator-history.routes.ts
- [ ] T072 [P] [US5] Implement frontend history filter state and query service in frontend/src/store/history-store.ts and frontend/src/modules/elevator/services/fetch-elevator-history.ts
- [ ] T073 [P] [US5] Implement history charts and records panel in frontend/src/modules/elevator/components/ElevatorHistoryPanel.tsx and frontend/src/modules/elevator/components/ElevatorHistoryChart.tsx
- [ ] T074 [US5] Add history query latency metrics and audit traces in backend/src/observability/history.metrics.ts

**Checkpoint**: User Story 5 is independently testable and supports investigation workflows without dependence on the AI features.

---

## Phase 8: User Story 6 - Surface Early Risk Warnings (Priority: P3)

**Goal**: Show predictive maintenance warnings from a dedicated AI service using curated elevator telemetry and usage history.

**Independent Test**: Publish predictive results for an elevator and verify authorized users see the warning, risk level, and attention window without any automated control action.

### Tests for User Story 6 ⚠️

- [ ] T075 [P] [US6] Add contract test for GET /analytics/risk in backend/tests/contract/risk-analytics.contract.test.ts
- [ ] T076 [P] [US6] Add AI service test for risk feature generation and scoring in ai-service/tests/test_risk_pipeline.py
- [ ] T077 [P] [US6] Add backend integration test for AI result ingestion and publishing in backend/tests/integration/risk-warning.integration.test.ts
- [ ] T078 [US6] Add frontend integration test for predictive warning rendering in frontend/tests/integration/risk-warning-panel.test.tsx

### Implementation for User Story 6

- [ ] T079 [P] [US6] Implement risk warning domain model and repository in backend/src/modules/analytics/risk-warning.model.ts and backend/src/modules/analytics/risk-warning.repository.ts
- [ ] T080 [P] [US6] Implement curated telemetry feature pipeline in ai-service/app/pipelines/elevator_feature_pipeline.py
- [ ] T081 [P] [US6] Implement predictive scoring service and FastAPI endpoint in ai-service/app/services/predictive_maintenance_service.py and ai-service/app/api/risk.py
- [ ] T082 [US6] Implement backend analytics ingestion and query service in backend/src/modules/analytics/risk-analytics.service.ts
- [ ] T083 [US6] Implement analytics API route and risk realtime publisher in backend/src/api/routes/analytics.routes.ts and backend/src/modules/realtime/publishers/risk.publisher.ts
- [ ] T084 [P] [US6] Implement frontend risk warning store and panel UI in frontend/src/store/risk-store.ts and frontend/src/modules/analytics/components/RiskWarningPanel.tsx
- [ ] T085 [US6] Add predictive observability and model version traceability in ai-service/app/services/model_registry.py and backend/src/observability/risk.metrics.ts

**Checkpoint**: All user stories are independently functional, with predictive insight layered onto the operational core.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and production-readiness work across all stories.

- [ ] T086 [P] Document local setup and operating procedures in README.md and docs/operations-dashboard.md
- [ ] T087 Harden security, rate limiting, and session expiry handling in backend/src/modules/auth/rate-limit.ts and backend/src/modules/auth/session-policy.ts
- [ ] T088 [P] Add end-to-end quickstart validation coverage in frontend/tests/e2e/quickstart-flow.spec.ts and backend/tests/performance/k6-smoke.js
- [ ] T089 Validate dashboards, alerts, and operational runbooks in infra/observability/grafana-dashboard.json and infra/observability/runbook.md
- [ ] T090 [P] Add performance and load tuning updates for WebSocket fan-out and history queries in backend/tests/performance/realtime-load.k6.js and backend/tests/performance/history-load.k6.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Stories (Phases 3-8)**: Depend on Foundational completion.
- **Polish (Phase 9)**: Depends on the completion of all targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational and forms the MVP.
- **US2 (P1)**: Depends on US1 shared elevator state and auth foundations, but remains independently testable once implemented.
- **US4 (P1)**: Depends on Foundational only; can proceed in parallel with US2 after live event plumbing exists.
- **US3 (P2)**: Depends on US1 elevator state contracts and frontend store slices.
- **US5 (P2)**: Depends on US1 event persistence and US4 alert persistence.
- **US6 (P3)**: Depends on US1 and US5 historical data flows and the AI service foundation from Setup.

### Within Each User Story

- Tests MUST be written and fail before implementation.
- Domain models and repositories come before services.
- Services come before routes, publishers, and UI integration.
- Realtime and failure-mode handling must be completed before a story is considered done.

### Parallel Opportunities

- T002-T006 can run in parallel after T001 establishes the workspace.
- T008-T013 and T015-T017 can run in parallel in Foundational after T007 sets contracts.
- In US1, T018-T020 and T022-T023 can run in parallel.
- In US2, T032-T034 and T036-T041 contain parallelizable slices across backend and frontend.
- In US4, T044-T046 and T048-T054 contain parallel backend/frontend work.
- In US3, T056-T057 and T061-T062 can run in parallel.
- In US5, T065-T067 and T069-T073 can run in parallel.
- In US6, T075-T078 and T079-T084 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch monitoring tests together:
Task: "T018 Contract test for GET /elevators and GET /elevators/{elevatorId} in backend/tests/contract/elevators.contract.test.ts"
Task: "T019 Backend integration test for Ditto event normalization in backend/tests/integration/elevator-monitoring.integration.test.ts"
Task: "T020 Frontend integration test for dashboard live updates in frontend/tests/integration/elevator-dashboard-live.test.tsx"

# Launch domain and UI slices together:
Task: "T022 Implement elevator twin and elevator event models in backend/src/modules/elevators/elevator-twin.model.ts and backend/src/modules/elevators/elevator-event.model.ts"
Task: "T027 Implement elevator store slice and selectors in frontend/src/store/elevator-store.ts and frontend/src/store/selectors/elevator-selectors.ts"
Task: "T028 Implement elevator dashboard list and summary cards in frontend/src/modules/elevator/components/ElevatorSummaryCards.tsx and frontend/src/modules/elevator/components/ElevatorList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate live monitoring with simulated realtime events.
5. Demo the dashboard before expanding into control and alerts.

### Incremental Delivery

1. Deliver US1 for live monitoring MVP.
2. Add US2 for safe command execution.
3. Add US4 for alert response and incident handling.
4. Add US3 for 3D spatial visibility.
5. Add US5 for historical review.
6. Add US6 for predictive maintenance insight.

### Parallel Team Strategy

1. One team completes Setup and Foundational together.
2. After Foundational, split by capability:
   - Developer A: US1 and then US3
   - Developer B: US2 and then US4
   - Developer C: US5 and then US6
3. Rejoin for Phase 9 hardening and load validation.

---

## Notes

- Total tasks: 90
- Story task counts: US1 = 14, US2 = 12, US3 = 8, US4 = 12, US5 = 10, US6 = 11
- MVP scope: Phase 1, Phase 2, and Phase 3 (US1) only
- All tasks follow the required checklist format with checkbox, ID, optional `[P]`, story label where needed, and exact file paths
