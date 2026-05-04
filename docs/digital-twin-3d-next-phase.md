# Digital Twin and 3D Dashboard Next Phase

## Purpose

This document defines the next implementation phase for the elevator Digital Twin and 3D operator interface. AI predictive maintenance is intentionally out of scope for this phase so the team can first stabilize Twin authority, realtime state, and spatial dashboard interaction.

## Scope

### In Scope

- Bootstrap elevator state from Eclipse Ditto through the backend.
- Normalize Ditto Thing payloads into the existing elevator state contract.
- Keep backend realtime synchronization authoritative for the frontend.
- Render a usable 3D elevator view driven by normalized backend state.
- Keep list, detail panel, alerts, and 3D selection synchronized.
- Show loading, empty, stale, degraded, and live states clearly.
- Validate the Digital Twin flow with backend, frontend, and quickstart tests.

### Out of Scope

- AI predictive warning scoring and model traceability.
- AI service deployment hardening.
- Historical analytics and model validation.
- Multi-building expansion beyond the existing scoped building contract.
- Direct frontend access to Ditto.

## Target Outcome

At the end of this phase, an operator can start the local stack, load the dashboard, see elevator state bootstrapped from the Twin, receive live updates, and inspect the same elevator consistently across the list, detail panel, alerts, and 3D scene.

## Architecture Direction

```text
Eclipse Ditto
  -> backend Ditto client
  -> backend normalization and authorization
  -> backend realtime event router
  -> frontend realtime store
  -> elevator store and 3D scene projection
```

The frontend must only consume backend-normalized API and realtime events. It must not call Ditto directly.

## Implementation Order

### Phase A: Twin Bootstrap

1. Confirm Ditto configuration in `backend/src/config/env.ts` and `backend/src/config/settings.ts`.
2. Use `backend/src/integrations/ditto/ditto-client.ts` to fetch current Thing state.
3. Map Ditto payloads according to `specs/003-digital-twin-3d/contracts/openapi.yaml` and `specs/003-digital-twin-3d/contracts/twin-3d-mapping.md`.
4. Store normalized elevator state in `backend/src/modules/elevators/elevator-state.repository.ts`.
5. Expose bootstrap readiness through backend health and synchronization state.

Acceptance criteria:

- Backend can start with Ditto config present.
- Current elevator state is available before waiting for new live events.
- Missing or malformed Twin records are reported as empty, partial, failed, or degraded bootstrap state.

### Phase B: Live Twin Synchronization

1. Route Ditto live events through `backend/src/modules/realtime/event-router.ts`.
2. Normalize events in `backend/src/modules/realtime/event-normalizer.ts`.
3. Reject duplicate, out-of-order, or out-of-scope elevator events.
4. Publish accepted updates through `backend/src/modules/realtime/publishers/elevator-state.publisher.ts`.
5. Track stale and degraded states in `backend/src/modules/realtime/session-manager.ts`.

Acceptance criteria:

- Accepted live events update the same normalized state created during bootstrap.
- Duplicate events do not create duplicate UI transitions.
- Stale or degraded synchronization is visible to the frontend.

### Phase C: 3D Scene Projection

1. Keep mapping logic in `frontend/src/modules/twin3d/services/map-elevator-state-to-scene.ts`.
2. Render elevator positions, direction, door state, and health state in `frontend/src/modules/twin3d/components/TwinScene.tsx`.
3. Keep `TwinControls.tsx` focused on view controls, not business state.
4. Use `TwinDetailOverlay.tsx` for selected elevator context.
5. Keep selection synchronized through the existing elevator store and `useTwinSelection`.

Acceptance criteria:

- The 3D view renders a non-empty scene when elevator state exists.
- Selecting an elevator in the list highlights or focuses the same elevator in 3D.
- Selecting an elevator in 3D updates the detail panel.
- Loading, empty, stale, and degraded states remain readable in the 3D area.

### Phase D: Operator Workflow Integration

1. Validate the main dashboard layout in `frontend/src/app/App.tsx`.
2. Keep list, summary cards, detail panel, alerts, and 3D view consistent.
3. Ensure tablet and desktop widths remain usable.
4. Avoid adding AI risk panel requirements to this phase.

Acceptance criteria:

- Operator can monitor the elevator fleet from one dashboard screen.
- The same elevator identity, floor, direction, and health state appear consistently across panels.
- Degraded Twin state does not make the dashboard blank or misleading.

## Test Plan

### Backend

Run:

```sh
cd backend
npm test
```

Required coverage:

- Ditto bootstrap mapping.
- Bootstrap plus live reconciliation.
- Duplicate and out-of-order realtime events.
- Building-scoped elevator list behavior.
- Health/readiness degraded state.

Relevant files:

- `backend/tests/integration/ditto-client.integration.test.ts`
- `backend/tests/integration/elevator-ditto-bootstrap.integration.test.ts`
- `backend/tests/integration/elevator-monitoring.integration.test.ts`
- `backend/tests/integration/elevator-realtime-resilience.test.ts`
- `backend/tests/contract/elevators.contract.test.ts`

### Frontend

Run:

```sh
cd frontend
npm test
npm run build
```

Required coverage:

- Dashboard loading, empty, ready, stale, and degraded rendering.
- Cross-panel selection consistency.
- 3D scene state binding.
- Quickstart operator flow without AI dependency.

Relevant files:

- `frontend/tests/integration/elevator-dashboard-live.test.tsx`
- `frontend/tests/integration/twin3d-binding.test.tsx`
- `frontend/tests/integration/twin3d-resilience.test.tsx`
- `frontend/tests/e2e/quickstart-flow.spec.ts`

## Manual Validation

1. Start infrastructure from `infra/docker/docker-compose.yml`.
2. Start backend with Ditto environment variables configured.
3. Confirm backend health reports bootstrap status.
4. Start frontend.
5. Confirm the dashboard first shows loading, then ready or degraded.
6. Replay a Twin elevator state update.
7. Confirm the elevator list, detail panel, and 3D scene update together.
8. Stop or delay Twin event delivery.
9. Confirm stale or degraded state appears without clearing the last accepted elevator state.

## Data Contract Checklist

Each normalized elevator state should include:

- `elevatorId`
- `buildingId`
- `status`
- `currentFloor`
- `targetFloor`
- `direction`
- `doorState`
- `loadPercentage`
- `healthState`
- synchronization metadata when available

## Risks

- Ditto payload drift can break mapping if unknown enum values are not normalized.
- 3D view can become misleading if it renders stale state without a clear degraded indicator.
- Selection can diverge if list and 3D scene maintain separate selected elevator state.
- Bootstrap and live updates can conflict if they do not share the same normalized repository.

## Recommended Task Breakdown

- DT3D-001: Verify Ditto bootstrap configuration and environment docs.
- DT3D-002: Harden Twin Thing to elevator mapping with malformed payload coverage.
- DT3D-003: Validate backend bootstrap readiness and degraded state reporting.
- DT3D-004: Validate live event reconciliation and idempotency.
- DT3D-005: Improve 3D scene projection from normalized elevator state.
- DT3D-006: Synchronize list, 3D scene, and detail panel selection.
- DT3D-007: Add manual quickstart steps for Twin and 3D validation.
- DT3D-008: Run backend and frontend validation without AI service dependency.

## Done Definition

- Backend bootstrap and live sync tests pass.
- Frontend 3D binding and resilience tests pass.
- Manual quickstart validates Twin-to-dashboard-to-3D flow.
- No frontend code calls Ditto directly.
- AI service is not required to demonstrate the phase.
