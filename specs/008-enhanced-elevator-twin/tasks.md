---
description: "Task list for Enhanced Elevator Digital Twin (008)"
---

# Tasks: Enhanced Elevator Digital Twin

**Input**: Design documents from `/specs/008-enhanced-elevator-twin/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  

**Tests**: Required per spec “User Scenarios & Testing *(mandatory)*” and plan (Vitest backend, frontend tests, quickstart validation).  

**Organization**: Phases follow user story priority (P1 → P2 → P3) after shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking deps)
- **[Story]**: `[US1]`…`[US5]` for user-story phases only

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align local validation and references with feature 008 before implementation.

- [X] T001 Verify backend/frontend Node 22 and TypeScript 5 per `specs/008-enhanced-elevator-twin/plan.md` in `backend/package.json` and `frontend/package.json`
- [X] T002 [P] Document required env vars from `specs/008-enhanced-elevator-twin/quickstart.md` in `backend/.env.example` and `frontend/.env.example` (no real secrets)
- [X] T003 [P] Cross-link contracts under `specs/008-enhanced-elevator-twin/contracts/` from `backend/src/contracts/README.md` (or create index) for implementers
- [X] T004 Confirm L72 seed / Ditto bootstrap path for enhanced Things is documented next to existing seed scripts in `infra/ditto/` or project seed docs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Versioned enhanced Twin contract, hydration, normalization, realtime envelope, and observability hooks that all stories depend on.

**⚠️ CRITICAL**: No user story work until this phase completes.

- [X] T005 Extend `EnhancedElevatorTwin` TypeScript types and `schemaVersion` `1.1.0` in `backend/src/modules/elevators/elevator-twin.model.ts` per `specs/008-enhanced-elevator-twin/data-model.md` and `contracts/enhanced-elevator-state.md`
- [X] T006 [P] Add Zod (or existing validator) schemas for enhanced fields, enums, ranges, and unknown fallbacks in `backend/src/modules/elevators/elevator-twin.validation.ts` (new file colocated with model)
- [X] T007 Implement merge-and-hydrate pipeline: partial Ditto merge + last accepted state → full scoped twin in `backend/src/modules/elevators/elevator-state.repository.ts` and Ditto integration under `backend/src/integrations/ditto/`
- [X] T008 [P] Publish normalized `elevator.state.changed` payloads only when materialized state is building-complete per `contracts/realtime-events.md` in `backend/src/modules/realtime/` (or equivalent publisher module)
- [X] T009 [P] Extend realtime envelope with `eventId`, `dataClass`, `correlationId` per `contracts/realtime-events.md` in shared realtime types under `backend/src/modules/realtime/`
- [X] T010 Add rejection counters (duplicate, out-of-order, out-of-scope, malformed, hydration, normalization) to synchronization payload consumed by `system.connection.state` per `contracts/realtime-events.md` in `backend/src/modules/realtime/` and `backend/src/observability/`
- [X] T011 [P] Structured logging + metrics for hydration failures and normalization rejects in `backend/src/observability/` wired from elevator merge path
- [X] T012 Update REST bootstrap JSON contract tests for schema `1.1.0` in `backend/tests/contract/elevators.contract.test.ts`
- [X] T013 Add integration test: partial Ditto merge yields full accepted projection in `backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts` (extend or add sibling test file)

**Checkpoint**: Backend can materialize, validate, and publish full enhanced elevator state with counters and tests green.

---

## Phase 3: User Story 1 — Inspect Rich Elevator State (Priority: P1)

**Goal**: List, detail, and raw inspection surfaces show expanded operational, telemetry, fault, and call fields with unknown/partial handling.

**Independent Test**: Bootstrap L72 enhanced dataset; list, detail, and inspection show identical expanded state per elevator (see `specs/008-enhanced-elevator-twin/spec.md` US1).

### Tests for User Story 1

- [X] T014 [P] [US1] Contract test: GET elevators bootstrap returns `schemaVersion` `1.1.0` and required enhanced fields shape in `backend/tests/contract/elevators.contract.test.ts`
- [X] T015 [P] [US1] Integration test: detail API returns merged state when source fields partial in `backend/tests/integration/elevator-monitoring.integration.test.ts`
- [X] T016 [P] [US1] Frontend integration test: detail panel renders labels, units, and “unknown” placeholders for missing fields in `frontend/tests/integration/` (add file if missing, e.g. `elevator-detail-enhanced.test.tsx`)

### Implementation for User Story 1

- [X] T017 [P] [US1] Map Ditto Thing attributes → `EnhancedElevatorTwin` including `fieldFreshness`, `stale`, calls, ETA in `backend/src/modules/elevators/elevator-monitoring.service.ts`
- [X] T018 [US1] Expose GET detail / list payloads using single materialized source in `backend/src/api/routes/` (elevator routes module)
- [X] T019 [P] [US1] Extend Zustand (or existing) elevator store types for enhanced fields in `frontend/src/store/` (elevator slice file)
- [X] T020 [P] [US1] Update `frontend/src/modules/elevator/components/ElevatorList.tsx` for freshness and expanded summary columns
- [X] T021 [US1] Refactor `frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx` into sections: state, telemetry, calls, faults, maintenance, history entry, commands per FR-008
- [X] T022 [US1] Wire `elevator.state.changed` handler to patch store without full reload in `frontend/src/services/realtime/` (websocket client)
- [X] T023 [P] [US1] Add explicit UI states: loading, empty, partial, stale per FR-016 in `frontend/src/modules/elevator/components/ElevatorDetailPanel.tsx`

**Checkpoint**: US1 independently testable; operator sees rich state with honest unknowns.

---

## Phase 4: User Story 2 — Faithful 3D Twin (Priority: P1)

**Goal**: 3D scene shows shafts, cabins, doors, movement, health, stale, degraded from same enhanced state as dashboard.

**Independent Test**: Seeded building; cabins in shafts, continuous position, door %, health cues (spec US2).

### Tests for User Story 2

- [X] T024 [P] [US2] Unit tests for `map-elevator-state-to-scene` including floor fallback vs `positionMeters` in `frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts` (vitest colocated or under `frontend/tests/`)
- [X] T025 [P] [US2] Component test: `ElevatorCabinMesh` reflects `doorOpenRatio` and fault/maintenance tone in `frontend/tests/integration/twin3d-cabin-visual.test.tsx` (new if needed)

### Implementation for User Story 2

- [X] T026 [P] [US2] Implement `BuildingShaftLayout` / `ShaftDefinition` loading (API or static config) consumed by `frontend/src/modules/twin3d/render/TwinStageGeometry.tsx`
- [X] T027 [US2] Align `ThreeDCabinProjection` derivation with `contracts/scene-projection.md` in `frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts`
- [X] T028 [P] [US2] Update `frontend/src/modules/twin3d/render/ElevatorShaftGroup.tsx` and `ElevatorCabinMesh.tsx` for door percentage visuals and health/fault overlays
- [X] T029 [US2] Ensure selection + camera use shared store via `frontend/src/modules/twin3d/hooks/useTwinSelection.ts` and `TwinCameraController.tsx`
- [X] T030 [P] [US2] Surface stale/degraded on cabin without hiding last position in `frontend/src/modules/twin3d/components/TwinDetailOverlay.tsx`

**Checkpoint**: US2 testable alone given US1 state feed (foundation + US1 data path).

---

## Phase 5: User Story 3 — Smooth Live Movement (Priority: P2)

**Goal**: Interpolation between accepted updates; duplicate/out-of-order handling; list/detail/3D stay consistent within 500 ms local goal.

**Independent Test**: Replay live field changes; surfaces converge; no state regression (spec US3).

### Tests for User Story 3

- [X] T031 [P] [US3] Backend integration: duplicate and out-of-order events do not regress materialized state; counters increment in `backend/tests/integration/elevator-realtime-resilience.test.ts`
- [X] T032 [P] [US3] Frontend unit: interpolation does not overshoot between two accepted positions in `frontend/src/modules/twin3d/services/twin3d-performance.ts` or dedicated interpolator module with tests under `frontend/tests/`

### Implementation for User Story 3

- [X] T033 [US3] Harden merge ordering and idempotency in `backend/src/modules/elevators/elevator-state.repository.ts`
- [X] T034 [P] [US3] Emit single normalized `elevator.state.changed` after batch accept in realtime publisher module under `backend/src/modules/realtime/`
- [X] T035 [US3] Implement rAF-safe interpolation targets from latest accepted twin in `frontend/src/modules/twin3d/render/TwinCanvasScene.tsx` (or dedicated hook)
- [X] T036 [P] [US3] Sync list/detail timestamps with 3D interpolation clock via shared store in `frontend/src/store/`
- [X] T037 [P] [US3] Expose rejection breakdown to dev/operator diagnostics panel (feature-flagged) in `frontend/src/modules/elevator/components/ElevatorSummaryCards.tsx` or new debug component

**Checkpoint**: US3 validates smooth live behavior and resilience counters.

---

## Phase 6: User Story 4 — Replay & Diagnose (Priority: P2)

**Goal**: Timeline scrub, historical mode distinct from live, partial history messaging.

**Independent Test**: Ingest short sequence; scrub; return to live (spec US4).

### Tests for User Story 4

- [X] T038 [P] [US4] Contract test: `GET /elevators/{id}/history` query/response per `contracts/playback.md` in `backend/tests/contract/elevator-history.contract.test.ts`
- [X] T039 [P] [US4] Integration test: partial history returns `missingFields` in `backend/tests/integration/elevator-history-partial-data.test.ts`
- [X] T040 [P] [US4] Frontend test: playback toggles `isPlayback` projection and does not clobber live store in `frontend/tests/integration/elevator-playback.test.tsx` (new)

### Implementation for User Story 4

- [X] T041 [US4] Extend `elevator-history.service.ts` and repositories to return `PlaybackSnapshot` frames per `data-model.md` in `backend/src/modules/elevators/`
- [X] T042 [P] [US4] Implement history route handler per `contracts/playback.md` in `backend/src/api/routes/`
- [X] T043 [P] [US4] Extend `frontend/src/modules/elevator/services/fetch-elevator-history.ts` for windowed queries and meta.partial
- [X] T044 [US4] Upgrade `frontend/src/modules/elevator/components/ElevatorHistoryPanel.tsx` for enhanced fields timeline and scrubber
- [X] T045 [US4] Feed playback snapshots into 3D projection path with `isPlayback: true` in `frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts`

**Checkpoint**: US4 independently demonstrable with bounded history.

---

## Phase 7: User Story 5 — Operator Controls (Priority: P3)

**Goal**: Policy-gated commands with audit, lifecycle UI, no unsafe mutation on reject.

**Independent Test**: Allowed vs disallowed commands; delayed failure paths (spec US5).

### Tests for User Story 5

- [X] T046 [P] [US5] Extend `backend/tests/contract/commands.contract.test.ts` for command types in `contracts/command-lifecycle.md`
- [X] T047 [P] [US5] Extend `backend/tests/integration/command-lifecycle.integration.test.ts` for rejected commands not mutating twin state
- [X] T048 [P] [US5] Frontend integration: `ElevatorCommandPanel` shows pending/succeeded/failed/timeouts in `frontend/tests/integration/elevator-commands.test.tsx` (new)

### Implementation for User Story 5

- [X] T049 [US5] Extend `command-policy.service.ts` and `command-execution.service.ts` for enhanced preconditions (stale, fault, maintenance) per spec edge cases in `backend/src/modules/elevators/`
- [X] T050 [P] [US5] Emit `elevator.command.status` events per `contracts/command-lifecycle.md` from `backend/src/modules/realtime/`
- [X] T051 [US5] Update `frontend/src/modules/elevator/services/submit-command.ts` and `ElevatorCommandPanel.tsx` for lifecycle visibility and simulated vs real labeling
- [X] T052 [P] [US5] Ensure audit records include correlation IDs in `backend/src/modules/elevators/command-audit.repository.ts`

**Checkpoint**: US5 safe command story complete with tests.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance goals, docs, security review, quickstart validation.

- [X] T053 [P] Measure and tune 500 ms / 2 s staleness thresholds per plan in `backend/src/modules/elevators/` and document in `specs/008-enhanced-elevator-twin/plan.md` appendix if changed
- [X] T054 [P] Scene performance pass for L72 replay in `frontend/src/modules/twin3d/services/twin3d-performance.ts`
- [X] T055 [P] FR-013 documentation: enumerate reads/writes for `realtime`, `telemetry`, `config`, `alarm` in `specs/008-enhanced-elevator-twin/plan.md` or `docs/`
- [X] T056 Run full `quickstart.md` validation sequence and record results in `specs/008-enhanced-elevator-twin/checklists/requirements.md`
- [X] T057 Security review: JWT scope, command audit, no frontend Ditto paths — checklist note in PR description template

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3–7 (US1–US5)** → **Phase 8**
- **US1** and **US2** are both P1 after Phase 2; **US2** depends on enhanced state in store (US1 backend path + minimal store fields) — sequence T017–T023 before heavy 3D polish, or stub projection until T017 complete.
- **US3** depends on US1+US2 data paths and realtime stability.
- **US4** depends on history services (Phase 2 contract) and US1 detail store.
- **US5** depends on US1 command UI shell and Phase 2 policy hooks.

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Phase 2 only |
| US2 | Phase 2 + US1 materialized state in API/store |
| US3 | US1, US2 |
| US4 | US1 + history foundation (T041–T042) |
| US5 | US1 + existing command modules |

### Parallel Opportunities

- Contract tests marked `[P]` within a story can run in parallel.
- T006/T008/T009/T011 parallel in Phase 2 after T005 shapes types.
- After Phase 2: split **US1 tests** vs **US2 projection tests** across developers.

### Parallel Example: User Story 1

```bash
# Parallel tests:
backend/tests/contract/elevators.contract.test.ts
backend/tests/integration/elevator-monitoring.integration.test.ts
frontend/tests/integration/elevator-detail-enhanced.test.tsx

# Parallel UI:
frontend/src/modules/elevator/components/ElevatorList.tsx
frontend/src/store/<elevator-slice>.ts
```

---

## Implementation Strategy

### MVP First (US1 + US2 minimal)

1. Phase 1–2  
2. Phase 3 (US1)  
3. Phase 4 (US2) with basic shaft layout  
4. STOP — validate quickstart steps 1–10  

### Incremental Delivery

1. Add US3 (smooth live + resilience)  
2. Add US4 (playback)  
3. Add US5 (commands)  
4. Phase 8 polish  

---

## Notes

- Every `[USn]` task maps to acceptance scenarios in `spec.md`.
- Prefer extending existing files listed in plan over new parallel modules.
- Simulated commands must remain visually distinct per `command-lifecycle.md`.
