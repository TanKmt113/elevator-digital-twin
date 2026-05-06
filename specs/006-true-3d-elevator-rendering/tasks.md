---

description: "Task list for True 3D Elevator Rendering"
---

# Tasks: True 3D Elevator Rendering

**Input**: Design documents from `/specs/006-true-3d-elevator-rendering/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Testing is REQUIRED. Include frontend integration, scene-runtime, camera-focus, realtime synchronization, render-readiness, and local validation coverage for the true 3D renderer.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (e.g. [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Docs/Specs**: `docs/`, `specs/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish phase-6 references, renderer dependencies, validation entry points, and 3D-specific test scaffolding.

- [X] T001 Update phase-6 references in README.md, AGENTS.md, and docs/operations-dashboard.md for specs/006-true-3d-elevator-rendering/
- [X] T002 [P] Add true-3D renderer dependencies and phase-6 validation scripts in frontend/package.json, frontend/package-lock.json, and specs/006-true-3d-elevator-rendering/quickstart.md
- [X] T003 [P] Add true-3D test scaffolding in frontend/tests/integration/twin3d-rendering.test.tsx and frontend/tests/e2e/twin3d-rendering.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared render contracts, capability/runtime state, and render adapter primitives used by all 3D stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define true-3D runtime and WebGL capability contracts in frontend/src/store/realtime-store.ts and frontend/src/app/App.tsx
- [X] T005 [P] Extend governed scene projection and render sample types in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/services/twin3d-performance.ts
- [X] T006 [P] Create base renderer adapters in frontend/src/modules/twin3d/render/TwinCanvasScene.tsx, frontend/src/modules/twin3d/render/TwinLightingRig.tsx, and frontend/src/modules/twin3d/render/TwinStageGeometry.tsx
- [X] T007 [P] Add foundational scene-runtime and capability regression tests in frontend/tests/integration/app-shell.test.ts and frontend/tests/integration/twin3d-binding.test.tsx
- [X] T008 Expose renderer availability and unsupported-browser behavior in frontend/src/modules/twin3d/components/TwinScene.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx

**Checkpoint**: Shared true-3D runtime, capability state, and render adapter foundation are ready.

---

## Phase 3: User Story 1 - View the Building in True 3D (Priority: P1) 🎯 MVP

**Goal**: The operator can open the dashboard and see shafts, floors, and cabins rendered in a readable true 3D building scene.

**Independent Test**: Load the active building dataset and confirm the 3D scene shows one cabin per in-scope elevator at the correct floor height, plus explicit empty or unavailable behavior when scene data cannot render.

### Tests for User Story 1 ⚠️

- [X] T009 [P] [US1] Add true-3D bootstrap readability test in frontend/tests/integration/twin3d-rendering.test.tsx
- [X] T010 [P] [US1] Add projection-to-world-position regression test in frontend/tests/integration/twin3d-binding.test.tsx
- [X] T011 [US1] Add local true-3D bootstrap validation coverage in frontend/tests/e2e/twin3d-rendering.spec.ts

### Implementation for User Story 1

- [X] T012 [P] [US1] Extend world-position and building-layout mapping in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts
- [X] T013 [P] [US1] Implement cabin and shaft meshes in frontend/src/modules/twin3d/render/ElevatorCabinMesh.tsx and frontend/src/modules/twin3d/render/ElevatorShaftGroup.tsx
- [X] T014 [P] [US1] Render the true 3D building scene and explicit empty-state fallback in frontend/src/modules/twin3d/render/TwinCanvasScene.tsx and frontend/src/modules/twin3d/components/TwinScene.tsx
- [X] T015 [US1] Surface scene readiness, projection count, and unavailable-scene messaging in frontend/src/app/App.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [X] T016 [US1] Document true-3D bootstrap validation in specs/006-true-3d-elevator-rendering/quickstart.md and docs/operations-dashboard.md

**Checkpoint**: The dashboard renders a readable true 3D building-wide elevator scene.

---

## Phase 4: User Story 2 - Inspect One Elevator with Real Camera Focus (Priority: P1)

**Goal**: The operator can select an elevator from the list or scene and get a predictable camera focus on that cabin while shared inspection state stays synchronized.

**Independent Test**: Select elevators alternately from the list and the true 3D scene, then verify the same elevator remains the shared selection target and the camera moves predictably between overview and selected focus.

### Tests for User Story 2 ⚠️

- [X] T017 [P] [US2] Add camera-focus synchronization tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/elevator-dashboard-live.test.tsx
- [X] T018 [P] [US2] Add focus continuity and missing-selection regression tests in frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 2

- [X] T019 [P] [US2] Extend shared focus context state in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts
- [X] T020 [P] [US2] Implement camera controller and bounded transitions in frontend/src/modules/twin3d/render/TwinCameraController.tsx and frontend/src/modules/twin3d/contracts/camera-focus.ts
- [X] T021 [P] [US2] Wire scene-to-list/detail selection synchronization in frontend/src/modules/twin3d/render/TwinCanvasScene.tsx and frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx
- [X] T022 [US2] Implement overview and selected-focus controls in frontend/src/modules/twin3d/components/TwinControls.tsx and frontend/src/modules/twin3d/components/TwinScene.tsx
- [X] T023 [US2] Preserve or predictably clear focus across bootstrap refresh in frontend/src/app/App.tsx and frontend/src/store/elevator-store.ts

**Checkpoint**: Selection and camera focus are reliable across list, detail, and true 3D scene.

---

## Phase 5: User Story 3 - Watch Live Cabin Movement and Door State in 3D (Priority: P2)

**Goal**: The operator sees cabin position, motion, and door-state changes update live in the true 3D scene in step with the rest of the dashboard.

**Independent Test**: Replay accepted live changes for floor movement, direction, door changes, and degraded state, then verify the 3D cabins move or update visually in sync with list and detail state.

### Tests for User Story 3 ⚠️

- [X] T024 [P] [US3] Add live scene update and door-state tests in frontend/tests/integration/elevator-dashboard-live.test.tsx and frontend/tests/integration/twin3d-rendering.test.tsx
- [X] T025 [P] [US3] Add malformed-value and degraded projection tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/twin3d-resilience.test.tsx

### Implementation for User Story 3

- [X] T026 [P] [US3] Extend cabin visual state and smoothing rules in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/render/ElevatorCabinMesh.tsx
- [X] T027 [P] [US3] Apply live cabin motion and door cues in frontend/src/modules/twin3d/render/TwinCanvasScene.tsx and frontend/src/modules/twin3d/render/ElevatorCabinMesh.tsx
- [X] T028 [P] [US3] Align scene stale and degraded semantics with shared realtime state in frontend/src/store/realtime-store.ts and frontend/src/services/realtime/elevator-events.ts
- [X] T029 [US3] Surface live synchronization, stale, and degraded render cues in frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx and frontend/src/app/App.tsx
- [X] T030 [US3] Stabilize live updates without disruptive camera resets in frontend/src/modules/twin3d/render/TwinCameraController.tsx and frontend/src/modules/twin3d/hooks/useTwinSelection.ts

**Checkpoint**: Live movement and door-state changes are reflected consistently in the true 3D scene.

---

## Phase 6: User Story 4 - Operate the 3D Scene Smoothly Under Local Validation Load (Priority: P2)

**Goal**: The operator can use the true 3D scene repeatedly under representative local load without losing responsiveness or readability.

**Independent Test**: Load the representative building dataset, switch focus repeatedly, replay live updates, and confirm the scene remains readable, responsive, and stable on supported desktop and laptop layouts.

### Tests for User Story 4 ⚠️

- [X] T031 [P] [US4] Add render-readiness, frame-budget, and overlay-readability tests in frontend/tests/integration/twin3d-rendering.test.tsx and frontend/tests/integration/twin3d-resilience.test.tsx
- [X] T032 [P] [US4] Add repeated focus and live-update operator validation coverage in frontend/tests/e2e/twin3d-rendering.spec.ts

### Implementation for User Story 4

- [X] T033 [P] [US4] Implement render-density and unsupported-browser fallbacks in frontend/src/modules/twin3d/services/twin3d-performance.ts and frontend/src/modules/twin3d/components/TwinScene.tsx
- [X] T034 [P] [US4] Improve overlay density and control readability in frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx and frontend/src/styles.css
- [X] T035 [P] [US4] Optimize repeated focus and scene updates in frontend/src/modules/twin3d/render/TwinCanvasScene.tsx and frontend/src/modules/twin3d/render/TwinCameraController.tsx
- [X] T036 [US4] Document true-3D validation and performance expectations in specs/006-true-3d-elevator-rendering/quickstart.md and docs/operations-dashboard.md

**Checkpoint**: The true 3D scene remains usable and responsive under representative local load.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final contract alignment, validation, documentation, and release readiness.

- [X] T037 [P] Refresh final true-3D contracts in specs/006-true-3d-elevator-rendering/contracts/scene-runtime.md and specs/006-true-3d-elevator-rendering/contracts/camera-focus.md
- [X] T038 [P] Add phase-6 validation commands in backend/package.json, frontend/package.json, and specs/006-true-3d-elevator-rendering/quickstart.md
- [X] T039 Harden phase-6 references and operator runbook notes in README.md, AGENTS.md, and docs/operations-dashboard.md
- [X] T040 Validate no frontend direct Ditto access and no AI-service dependency in frontend/src/ and specs/006-true-3d-elevator-rendering/quickstart.md
- [X] T041 Run backend and frontend validation for true-3D runtime coverage in backend/tests/ and frontend/tests/
- [X] T042 Mark implementation completion state in specs/006-true-3d-elevator-rendering/tasks.md after all validation passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work
- **User Stories (Phases 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational and establishes the true 3D render baseline
- **User Story 2 (P1)**: Can start after Foundational, but benefits from US1 cabin/shaft rendering semantics
- **User Story 3 (P2)**: Depends on US1 scene rendering and practically depends on US2 camera continuity for stable live focus behavior
- **User Story 4 (P2)**: Depends on US1-US3 behaviors to validate responsiveness and readability under representative load

### Within Each User Story

- Tests MUST be written and fail before implementation
- Shared store and scene contract changes come before renderer wiring
- Renderer primitives come before higher-level interaction and overlay behaviors
- Live synchronization semantics come before performance polish
- Story should be complete before moving to the next priority if working sequentially

### Parallel Opportunities

- T002-T003 can run in parallel after T001
- T005-T007 can run in parallel during Foundational after T004 is understood
- In US1, T009-T010 and T012-T014 can run in parallel across tests and renderer work
- In US2, T017-T018 and T019-T021 can run in parallel across focus-state and camera slices
- In US3, T024-T025 and T026-T028 can run in parallel across live-state tests and renderer semantics
- In US4, T031-T032 and T033-T035 can run in parallel across validation and optimization slices

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "T009 [US1] true-3D bootstrap readability test in frontend/tests/integration/twin3d-rendering.test.tsx"
Task: "T010 [US1] projection-to-world-position regression test in frontend/tests/integration/twin3d-binding.test.tsx"

# Launch renderer work for User Story 1 together:
Task: "T012 [US1] extend world-position mapping in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts"
Task: "T013 [US1] implement cabin and shaft meshes in frontend/src/modules/twin3d/render/ElevatorCabinMesh.tsx and frontend/src/modules/twin3d/render/ElevatorShaftGroup.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T017 [US2] camera-focus synchronization tests in frontend/tests/integration/twin3d-binding.test.tsx and frontend/tests/integration/elevator-dashboard-live.test.tsx"
Task: "T019 [US2] extend shared focus context state in frontend/src/store/elevator-store.ts and frontend/src/modules/twin3d/hooks/useTwinSelection.ts"
Task: "T020 [US2] implement camera controller in frontend/src/modules/twin3d/render/TwinCameraController.tsx and frontend/src/modules/twin3d/contracts/camera-focus.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T024 [US3] live scene update and door-state tests in frontend/tests/integration/elevator-dashboard-live.test.tsx and frontend/tests/integration/twin3d-rendering.test.tsx"
Task: "T026 [US3] extend cabin visual state and smoothing rules in frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts and frontend/src/modules/twin3d/render/ElevatorCabinMesh.tsx"
Task: "T028 [US3] align scene stale and degraded semantics in frontend/src/store/realtime-store.ts and frontend/src/services/realtime/elevator-events.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the dashboard renders a readable true 3D building scene on seeded local data

### Incremental Delivery

1. Deliver US1 so the dashboard has a true 3D scene baseline
2. Deliver US2 so shared selection gains real camera focus behavior
3. Deliver US3 so live cabin movement and door cues stay synchronized with the dashboard
4. Deliver US4 so the scene remains responsive and readable under representative local load
5. Finish with contracts, validation commands, runbook notes, and completion tracking
