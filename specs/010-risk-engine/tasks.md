# Tasks: Realtime Risk Engine

**Input**: Design documents from `/specs/010-risk-engine/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Testing is REQUIRED for this feature. Backend rule evaluation, realtime publication, analytics contract/readiness, duplicate suppression, and frontend warning rendering must be covered before implementation tasks in each story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks
- **[Story]**: User story label for story phases only
- Every task includes an exact repository file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare focused fixtures and inspect the existing analytics/realtime paths before changing behavior.

- [X] T001 Review existing risk contracts and analytics wiring in `backend/src/contracts/risk.ts` and `backend/src/modules/analytics/risk-analytics.service.ts`
- [X] T002 [P] Add backend risky and normal elevator state fixtures in `backend/tests/fixtures/risk-engine.fixtures.ts`
- [X] T003 [P] Add frontend risk warning render fixtures in `frontend/tests/fixtures/risk-warning.fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, constants, and observability used by all user stories.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Extend `RiskWarning` and driver trace types for structured rule drivers in `backend/src/contracts/risk.ts`
- [X] T005 [P] Define deterministic rule ids, thresholds, prediction windows, and rule version constants in `backend/src/modules/analytics/risk-rule.constants.ts`
- [X] T006 [P] Extend risk observability counters for evaluated, generated, suppressed, rejected, and publish failures in `backend/src/observability/risk.metrics.ts`
- [X] T007 Update frontend risk store types to accept structured drivers while preserving string driver compatibility in `frontend/src/store/risk-store.ts`

**Checkpoint**: Foundation ready; user story implementation can now start.

---

## Phase 3: User Story 1 - Detect realtime maintenance risk (Priority: P1) MVP

**Goal**: Backend evaluates every accepted realtime elevator state and creates predictive warnings for door blockage, fault, thermal, vibration, and repeated overload conditions while ignoring normal states.

**Independent Test**: Feed risky and normal accepted elevator states and verify expected warnings are created only for risky inputs.

### Tests for User Story 1

- [X] T008 [P] [US1] Add rule evaluation tests for door blockage, active fault, thermal, vibration, overload, stale state, and normal state in `backend/tests/integration/risk-engine.integration.test.ts`
- [X] T009 [P] [US1] Add realtime live-event integration tests proving accepted elevator states invoke risk evaluation and warning publication in `backend/tests/integration/realtime-risk-engine.integration.test.ts`
- [X] T010 [US1] Add failure isolation tests proving risk evaluation errors do not block elevator realtime updates in `backend/tests/integration/risk-engine.integration.test.ts`

### Implementation for User Story 1

- [X] T011 [US1] Implement deterministic `RiskEngineService` evaluation output in `backend/src/modules/analytics/risk-engine.service.ts`
- [X] T012 [US1] Integrate `RiskEngineService` after accepted live elevator state handling in `backend/src/api/server.ts`
- [X] T013 [US1] Persist generated warnings through the existing analytics ingestion path in `backend/src/modules/analytics/risk-analytics.service.ts`
- [X] T014 [US1] Publish newly accepted risk warnings through the backend realtime channel in `backend/src/modules/realtime/publishers/risk.publisher.ts`
- [X] T015 [US1] Record evaluated, generated, rejected, and publish failure metrics in `backend/src/observability/risk.metrics.ts`

**Checkpoint**: User Story 1 is functional and testable as the MVP.

---

## Phase 4: User Story 2 - Explain why a warning exists (Priority: P2)

**Goal**: Every generated warning exposes human-readable drivers, severity contribution, prediction window, rule version, validation run id, and model trace metadata in analytics and realtime payloads.

**Independent Test**: Trigger each supported risk condition independently and verify backend payloads and frontend analytics rendering include driver labels and trace metadata.

### Tests for User Story 2

- [X] T016 [P] [US2] Add analytics contract tests for structured drivers, rule trace fields, prediction window, and verification status in `backend/tests/contract/risk-analytics.contract.test.ts`
- [X] T017 [P] [US2] Add frontend rendering tests for driver labels, localized risk levels, prediction window, and trace chips in `frontend/tests/integration/risk-warning-panel.test.tsx`
- [X] T018 [P] [US2] Add realtime event payload tests for structured driver compatibility in `backend/tests/contract/realtime-risk-event.contract.test.ts`

### Implementation for User Story 2

- [X] T019 [US2] Normalize structured drivers and trace metadata in `backend/src/modules/analytics/risk-analytics.service.ts`
- [X] T020 [US2] Ensure realtime risk events emit structured drivers and backward-compatible labels in `backend/src/modules/realtime/publishers/risk.publisher.ts`
- [X] T021 [US2] Map structured risk warnings into frontend view state in `frontend/src/store/risk-store.ts`
- [X] T022 [US2] Render Vietnamese driver labels, risk levels, prediction window, verification status, and trace metadata in `frontend/src/modules/analytics/components/RiskWarningPanel.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Avoid noisy duplicate warnings (Priority: P3)

**Goal**: Equivalent repeated risk states for the same elevator and condition do not flood analytics, while worsening severity updates the active warning.

**Independent Test**: Feed repeated equivalent states and verify only one active warning exists; then worsen severity and verify the active warning updates.

### Tests for User Story 3

- [X] T023 [P] [US3] Add duplicate suppression tests for same elevator, risk type, and active window in `backend/tests/integration/risk-engine-duplicates.integration.test.ts`
- [X] T024 [P] [US3] Add severity escalation tests for warning-to-critical updates in `backend/tests/integration/risk-warning-repository.integration.test.ts`
- [X] T025 [US3] Add readiness and suppression metric tests for duplicate and persistence failure paths in `backend/tests/integration/risk-engine-duplicates.integration.test.ts`

### Implementation for User Story 3

- [X] T026 [US3] Add active warning identity and equivalent-condition window handling in `backend/src/modules/analytics/risk-engine.service.ts`
- [X] T027 [US3] Implement active warning upsert and severity escalation behavior in `backend/src/modules/analytics/risk-warning.repository.ts`
- [X] T028 [US3] Report duplicate suppression and degraded readiness states in `backend/src/modules/analytics/risk-analytics.service.ts`
- [X] T029 [US3] Expose suppressed and readiness metrics through `backend/src/observability/risk.metrics.ts`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and operational finishing work across the completed stories.

- [X] T030 [P] Update manual validation steps for simulator-driven risk scenarios in `specs/010-risk-engine/quickstart.md`
- [X] T031 [P] Document risk engine metrics, degraded readiness, and failure handling in `docs/risk-engine-operations.md`
- [X] T032 Run backend build and test validation using scripts documented in `backend/package.json`
- [X] T033 Run frontend build and test validation using scripts documented in `frontend/package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; can start immediately.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; provides MVP risk generation.
- **Phase 4 US2**: Depends on Phase 2 and can be developed after or alongside US1 once shared contracts are stable; final integration expects US1 warning output.
- **Phase 5 US3**: Depends on Phase 2 and integrates with US1 warning generation; can be validated independently with repository fixtures.
- **Phase 6 Polish**: Depends on completed desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundation; no dependency on US2 or US3.
- **US2 (P2)**: Starts after Foundation; consumes the warning contract and can use fixtures before US1 is fully wired.
- **US3 (P3)**: Starts after Foundation; depends on the warning identity model and repository behavior.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Contract/type changes precede service implementation.
- Services precede event handler, repository, publisher, and UI integration.
- Metrics and readiness handling must be validated before story checkpoint.

---

## Parallel Opportunities

- **Setup**: T002 and T003 can run in parallel after T001 starts.
- **Foundation**: T005 and T006 can run in parallel; T007 can run after T004 defines final warning shape.
- **US1**: T008 and T009 can run in parallel; T011 can start after T004 and T005; T013, T014, and T015 can be split after T012 defines integration points.
- **US2**: T016, T017, and T018 can run in parallel; T021 and T022 can run together once T007 is complete.
- **US3**: T023 and T024 can run in parallel; T027 and T029 can run separately after T026 defines the active warning identity.
- **Polish**: T030 and T031 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "T008 [P] [US1] Add rule evaluation tests for door blockage, active fault, thermal, vibration, overload, stale state, and normal state in backend/tests/integration/risk-engine.integration.test.ts"
Task: "T009 [P] [US1] Add realtime live-event integration tests proving accepted elevator states invoke risk evaluation and warning publication in backend/tests/integration/realtime-risk-engine.integration.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T016 [P] [US2] Add analytics contract tests for structured drivers, rule trace fields, prediction window, and verification status in backend/tests/contract/risk-analytics.contract.test.ts"
Task: "T017 [P] [US2] Add frontend rendering tests for driver labels, localized risk levels, prediction window, and trace chips in frontend/tests/integration/risk-warning-panel.test.tsx"
Task: "T018 [P] [US2] Add realtime event payload tests for structured driver compatibility in backend/tests/contract/realtime-risk-event.contract.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "T023 [P] [US3] Add duplicate suppression tests for same elevator, risk type, and active window in backend/tests/integration/risk-engine-duplicates.integration.test.ts"
Task: "T024 [P] [US3] Add severity escalation tests for warning-to-critical updates in backend/tests/integration/risk-warning-repository.integration.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 User Story 1.
4. Validate backend rule evaluation and live-event publication independently.
5. Demo by running the simulator and confirming warnings appear in `/analytics`.

### Incremental Delivery

1. Add US1 for deterministic warning generation from accepted realtime state.
2. Add US2 for driver explanations, traceability, and frontend rendering.
3. Add US3 for duplicate suppression and severity escalation.
4. Run backend and frontend validation before marking the feature complete.

### Team Parallel Strategy

1. One developer owns backend rules and live-event integration.
2. One developer owns analytics contracts, trace fields, and realtime payloads.
3. One developer owns frontend rendering and UI tests.
4. One developer owns duplicate suppression, repository behavior, and metrics.
