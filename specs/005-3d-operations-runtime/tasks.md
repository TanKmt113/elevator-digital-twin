---

description: "Task list for 3D Operations Runtime"
---

# Tasks: 3D Operations Runtime

**Input**: Design documents from `/specs/005-3d-operations-runtime/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include frontend integration, scene-state, realtime synchronization, performance-signal, and local validation coverage for the 3D runtime.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Docs/Specs**: `docs/`, `specs/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish phase-5 references, validation entry points, and 3D-specific test scaffolding.

- [ ] T001 Update phase-5 references in README.md, AGENTS.md, and docs/operations-dashboard.md for specs/005-3d-operations-runtime/
- [ ] T002 [P] Add phase-5 validation scripts and 3D runtime notes in backend/package.json, frontend/package.json, and specs/005-3d-operations-runtime/quickstart.md
- [ ] T003 [P] Add 3D operations runtime test scaffolding in frontend/tests/integration/twin3d-operations.test.tsx and frontend/tests/e2e/twin3d-operations.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared scene contracts, focus state, projection model, and synchronization semantics used by all 3D stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define shared scene focus and runtime contracts in frontend/src/store/elevator-store.ts and frontend/src/store/realtime-store.ts
- [ ] T005 [P] Extend governed scene projection types and performance samples in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/services/twin3d-performance.ts
- [ ] T006 [P] Add shared selection and scene-runtime regression tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/app-shell.test.ts
- [ ] T007 Expose scene synchronization and degraded-state foundations in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx

**Checkpoint**: Shared 3D scene contracts, focus state, and synchronization semantics are ready.

---

## Phase 3: User Story 1 - Read Building State in 3D (Priority: P1) 🎯 MVP

**Goal**: The operator can read building elevator position and operational state directly from the 3D scene.

**Independent Test**: Load the active building dataset and confirm the 3D view shows one readable elevator representation per scoped elevator, including distinguishable floor and state cues.

### Tests for User Story 1 ⚠️

- [ ] T008 [P] [US1] Add scene bootstrap readability test in frontend/tests/integration/twin3d-operations.test.tsx
- [ ] T009 [P] [US1] Add projection-mapping regression test for floor, door, and health cues in frontend/tests/integration/twin3d-binding.test.tsx
- [ ] T010 [US1] Add local scene bootstrap validation coverage in frontend/tests/e2e/twin3d-operations.spec.ts

### Implementation for User Story 1

- [ ] T011 [P] [US1] Extend scene asset mapping for spatial position and visual state cues in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts
- [ ] T012 [P] [US1] Render readable elevator stage states and explicit empty-scene behavior in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/ElevatorMesh.tsx
- [ ] T013 [US1] Surface scene readiness and state interpretation in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [ ] T014 [US1] Document 3D scene bootstrap validation in specs/005-3d-operations-runtime/quickstart.md and docs/operations-dashboard.md

**Checkpoint**: The 3D scene is a readable spatial overview of the active building.

---

## Phase 4: User Story 2 - Inspect and Focus an Elevator Spatially (Priority: P1)

**Goal**: The operator can select an elevator from the scene or list and keep one synchronized focus context across the dashboard.

**Independent Test**: Select elevators alternately from the list and 3D scene, then verify the same elevator remains focused in scene and detail surfaces without unstable focus changes.

### Tests for User Story 2 ⚠️

- [ ] T015 [P] [US2] Add selection synchronization integration tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [ ] T016 [P] [US2] Add focus continuity regression coverage for resync and missing selection cases in frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 2

- [ ] T017 [P] [US2] Extend shared selected-elevator and focus-mode state in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts
- [ ] T018 [P] [US2] Implement scene-to-list/detail selection synchronization in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [ ] T019 [US2] Implement operator overview and selected-elevator focus controls in frontend/src/modules/twin3d/components/TwinControls.tsx and frontend/src/modules/twin3d/components/TwinScene.tsx
- [ ] T020 [US2] Preserve or predictably clear focus across bootstrap refresh in frontend/src/app/App.tsx and frontend/src/store/elevator-store.ts

**Checkpoint**: Selection and focus are shared reliably across list, detail, and 3D surfaces.

---

## Phase 5: User Story 3 - Follow Live Operational Changes in 3D (Priority: P2)

**Goal**: The operator sees live movement and degraded-state changes in the scene in step with the rest of the dashboard.

**Independent Test**: Replay accepted live changes for movement, door state, warning state, and stale/degraded state, then verify the 3D scene updates in sync with list and detail views.

### Tests for User Story 3 ⚠️

- [ ] T021 [P] [US3] Add live scene update and degraded-state tests in frontend/tests/integration/elevator-dashboard-live.test.tsx and frontend/tests/integration/twin3d-resilience.test.tsx
- [ ] T022 [P] [US3] Add projection failure-mode coverage for malformed or unknown scene values in frontend/tests/integration/twin3d-binding.test.tsx

### Implementation for User Story 3

- [ ] T023 [P] [US3] Extend scene asset state for maintenance, fault, offline, and degraded visuals in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/components/ElevatorMesh.tsx
- [ ] T024 [P] [US3] Apply realtime synchronization cues to scene overlay and empty states in frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx and frontend/src/app/App.tsx
- [ ] T025 [US3] Wire live scene updates without disruptive focus resets in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/hooks/useTwinSelection.ts
- [ ] T026 [US3] Align scene stale and degraded semantics with shared realtime state in frontend/src/store/realtime-store.ts and frontend/src/services/realtime/elevator-events.ts

**Checkpoint**: Live operational changes are reflected consistently in the 3D scene.

---

## Phase 6: User Story 4 - Operate the Scene Efficiently Under Real Load (Priority: P2)

**Goal**: The operator can use the 3D scene responsively under representative local load without losing readability or focus continuity.

**Independent Test**: Load the representative building dataset, switch focus repeatedly, replay live updates, and confirm the scene remains readable and responsive without overlapping critical overlays.

### Tests for User Story 4 ⚠️

- [ ] T027 [P] [US4] Add performance-signal and overlay-readability tests in frontend/tests/integration/twin3d-operations.test.tsx and frontend/tests/integration/twin3d-resilience.test.tsx
- [ ] T028 [P] [US4] Add repeated selection and live-update operator validation coverage in frontend/tests/e2e/twin3d-operations.spec.ts

### Implementation for User Story 4

- [ ] T029 [P] [US4] Implement overlay density and readability controls in frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx and frontend/src/styles.css
- [ ] T030 [P] [US4] Implement render-budget and projection-count sampling in frontend/src/modules/twin3d/services/twin3d-performance.ts and frontend/src/modules/twin3d/components/TwinScene.tsx
- [ ] T031 [US4] Stabilize scene updates under repeated selection and live changes in frontend/src/modules/twin3d/hooks/useTwinSelection.ts and frontend/src/modules/twin3d/components/TwinScene.tsx
- [ ] T032 [US4] Document 3D runtime validation and performance expectations in specs/005-3d-operations-runtime/quickstart.md and docs/operations-dashboard.md

**Checkpoint**: The 3D scene remains usable and responsive under representative local load.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final contract alignment, validation, documentation, and release readiness.

- [ ] T033 [P] Refresh final 3D scene contracts in specs/005-3d-operations-runtime/contracts/scene-state.md and specs/005-3d-operations-runtime/contracts/scene-interactions.md
- [ ] T034 [P] Run and document phase-5 backend and frontend validation in backend/package.json, frontend/package.json, and specs/005-3d-operations-runtime/quickstart.md
- [ ] T035 Harden phase-5 references and operator runbook notes in AGENTS.md, README.md, and docs/operations-dashboard.md
- [ ] T036 Validate no frontend direct Ditto access and no AI-service dependency in frontend/src/ and specs/005-3d-operations-runtime/quickstart.md
- [ ] T037 Mark implementation completion state in specs/005-3d-operations-runtime/tasks.md after all validation passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: Depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - establishes readable scene projection and is the MVP
- **User Story 2 (P1)**: Can start after Foundational, but benefits from US1 scene projection semantics
- **User Story 3 (P2)**: Depends on US1 scene state and practically depends on US2 selection continuity for stable live focus behavior
- **User Story 4 (P2)**: Depends on US1-US3 behaviors to validate responsive operation under representative load

### Within Each User Story

- Tests MUST be written and fail before implementation
- Shared store and projection model changes come before component wiring
- Scene rendering comes before focus and overlay refinements
- Realtime and degraded semantics come before performance polish
- Story complete before moving to the next priority if working sequentially

### Parallel Opportunities

- T002-T003 can run in parallel after T001
- T005-T006 can run in parallel during Foundational after T004 is understood
- In US1, T008-T009 and T011-T012 can run in parallel across tests and scene rendering
- In US2, T015-T016 and T017-T018 can run in parallel across selection state and scene synchronization slices
- In US3, T021-T022 and T023-T024 can run in parallel across live-state tests and visual semantics
- In US4, T027-T028 and T029-T030 can run in parallel across validation and performance slices

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "T008 [US1] scene bootstrap readability test in frontend/tests/integration/twin3d-operations.test.tsx"
Task: "T009 [US1] projection-mapping regression test in frontend/tests/integration/twin3d-binding.test.tsx"

# Launch rendering work for User Story 1 together:
Task: "T011 [US1] extend scene asset mapping in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts"
Task: "T012 [US1] render readable stage states in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/ElevatorMesh.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T015 [US2] selection synchronization tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/elevator-dashboard-live.test.tsx"
Task: "T017 [US2] extend selected-elevator and focus-mode state in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts"
Task: "T019 [US2] implement operator focus controls in frontend/src/modules/twin3d/components/TwinControls.tsx and frontend/src/modules/twin3d/components/TwinScene.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T021 [US3] live scene update and degraded-state tests in frontend/tests/integration/elevator-dashboard-live.test.tsx and frontend/tests/integration/twin3d-resilience.test.tsx"
Task: "T023 [US3] extend scene visuals for maintenance, fault, offline, and degraded states in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/components/ElevatorMesh.tsx"
Task: "T026 [US3] align scene stale/degraded semantics in frontend/src/store/realtime-store.ts and frontend/src/services/realtime/elevator-events.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the 3D scene is readable as a spatial overview on seeded local data

### Incremental Delivery

1. Deliver US1 so the scene becomes a trustworthy operational overview
2. Deliver US2 so spatial selection and focus become operator-usable
3. Deliver US3 so live and degraded state changes are reflected consistently in 3D
4. Deliver US4 so the scene remains readable and responsive under representative local load
5. Finish with contracts, validation commands, runbook notes, and completion tracking
