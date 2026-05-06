# Feature Specification: Digital Twin and 3D Operations View

**Feature Branch**: `[003-digital-twin-3d]`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Ưu tiên thực hiện Digital Twin và giao diện 3D trước; chưa làm phần liên quan đến AI predictive maintenance trong giai đoạn này."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Current Twin State (Priority: P1)

An operator opens the operations dashboard and sees the current elevator state sourced from the Digital Twin before relying on newly arriving live events.

**Why this priority**: This is the minimum useful slice. Without trustworthy current Twin state, the dashboard can show incomplete or stale operational information at startup.

**Independent Test**: Can be tested by starting the backend with an authorized Twin source, loading the dashboard, and verifying that current elevator state appears or a clear degraded state is shown without waiting for a new elevator event.

**Acceptance Scenarios**:

1. **Given** the Twin contains authorized elevator state for the active building, **When** the backend starts and the operator opens the dashboard, **Then** the dashboard shows the current elevator list, status, floor, direction, door state, and health state.
2. **Given** the Twin bootstrap is partially unavailable, **When** the operator opens the dashboard, **Then** the dashboard preserves a clear loading, partial, empty, or degraded state instead of showing misleading blank data.

---

### User Story 2 - Keep Live Twin Updates Synchronized (Priority: P1)

An operator watches elevator state update live across the dashboard after the initial Twin state has loaded.

**Why this priority**: Live synchronization is required for operational monitoring and must reuse the same state semantics as bootstrap.

**Independent Test**: Can be tested by replaying accepted Twin elevator updates and verifying the dashboard projections update once, in order, and only for elevators in the active scope.

**Acceptance Scenarios**:

1. **Given** the dashboard has bootstrapped elevator state, **When** a valid live elevator update arrives, **Then** the list, detail panel, and 3D view reflect the same accepted state.
2. **Given** duplicate, late, or out-of-scope events arrive, **When** the backend evaluates them, **Then** rejected events do not create duplicate or inconsistent dashboard transitions.

---

### User Story 3 - Inspect Elevators in 3D (Priority: P2)

An operator uses the 3D view to inspect elevator position and state, with selection synchronized across the 3D scene and dashboard panels.

**Why this priority**: The 3D view turns raw Twin state into an operator-friendly spatial view, but it depends on the authoritative bootstrap and live synchronization flows.

**Independent Test**: Can be tested by loading seeded elevator state, selecting an elevator in the list and 3D view, and verifying that both interactions focus the same elevator and update the detail context.

**Acceptance Scenarios**:

1. **Given** elevator state exists for the active building, **When** the operator opens the 3D view, **Then** the scene shows non-empty elevator representations with floor, direction, door, and health cues.
2. **Given** an operator selects an elevator in the list, **When** the 3D view is visible, **Then** the same elevator is highlighted or focused in the 3D scene.
3. **Given** an operator selects an elevator in the 3D scene, **When** the detail panel is visible, **Then** the detail panel shows the selected elevator.

---

### User Story 4 - Operate Through Degraded Twin Conditions (Priority: P2)

An operator continues to use the dashboard safely when Twin bootstrap or live synchronization is delayed, stale, or degraded.

**Why this priority**: Operational dashboards must avoid hiding failures or presenting stale state as live state.

**Independent Test**: Can be tested by interrupting Twin connectivity or delaying events and verifying the dashboard keeps the last accepted state visible with a clear stale or degraded indicator.

**Acceptance Scenarios**:

1. **Given** live synchronization becomes stale, **When** the operator continues monitoring, **Then** the dashboard and 3D view keep the last accepted state visible and label it as stale or degraded.
2. **Given** Twin state is unavailable for the active scope, **When** the operator opens the dashboard, **Then** the dashboard explains that current Twin state is unavailable and does not require the AI service to run.

### Edge Cases

- Twin bootstrap returns no elevators for the active building.
- Twin records are missing required elevator fields.
- Twin records contain unknown enum values for status, direction, door state, or health state.
- Live events arrive late, duplicated, out of order, or for elevators outside the active building scope.
- The realtime connection drops after successful bootstrap.
- The 3D scene receives valid elevator state while layout dimensions are small or tablet-sized.
- The AI service is offline or not started during this phase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load current elevator state from the Digital Twin for the active building before treating the dashboard as ready.
- **FR-002**: System MUST normalize Twin elevator records into one governed elevator state model shared by bootstrap, live updates, list views, detail views, and the 3D view.
- **FR-003**: System MUST expose explicit loading, ready, empty, stale, partial, and degraded dashboard states for Twin synchronization.
- **FR-004**: System MUST reject or isolate duplicate, out-of-order, malformed, and out-of-scope live elevator events.
- **FR-005**: System MUST preserve the last accepted elevator state when live synchronization becomes stale or degraded.
- **FR-006**: Feature MUST read `realtime`, `telemetry`, `config`, and `alarm` data classes only through backend-mediated Digital Twin and dashboard contracts. The canonical Twin entities are building-scoped elevator twins.
- **FR-007**: Feature MUST use backend-mediated API and realtime event paths for clients; frontend direct access to Twin infrastructure is not allowed.
- **FR-008**: Feature MUST enforce authenticated operator access scoped by building and role, and MUST provide observability for bootstrap status, live synchronization status, rejected events, and 3D projection readiness.
- **FR-009**: System MUST render a 3D elevator view driven by normalized elevator state.
- **FR-010**: Users MUST be able to select an elevator from the list or the 3D scene and see one synchronized selected elevator context.
- **FR-011**: System MUST allow the Digital Twin and 3D dashboard flow to run without requiring AI predictive maintenance services.
- **FR-012**: System MUST document a validation path for local Twin bootstrap, live update replay, 3D view inspection, and degraded-state handling.

### Key Entities *(include if feature involves data)*

- **Building Scope**: Represents the authorized building context used to filter elevator state and dashboard visibility.
- **Elevator Twin**: Represents the Digital Twin source record for one elevator, including identity, building relationship, floor, direction, door state, operational status, load, and health.
- **Normalized Elevator State**: Represents the backend-governed elevator state consumed by dashboard panels and realtime clients.
- **Realtime Synchronization State**: Represents whether Twin-derived state is loading, live, stale, resynchronizing, empty, partial, or degraded.
- **3D Elevator Projection**: Represents the visual state derived from normalized elevator state for placement, highlighting, direction, door, and health cues in the 3D scene.
- **Selected Elevator Context**: Represents the single active elevator selection shared by list, detail panel, alerts, and 3D view.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: The Digital Twin remains the source of truth for current elevator state. Bootstrap and live synchronization must both derive from Twin state and must be normalized by the backend before reaching clients.
- **Realtime Model**: Live elevator updates are pushed through backend-managed realtime channels. Clients receive accepted normalized events and synchronization-state events, with reconnection and stale-state signaling handled explicitly.
- **Failure Handling**: If Twin bootstrap, live delivery, or realtime sessions fail, the dashboard shows loading, empty, stale, partial, or degraded states and preserves the last accepted state where available.
- **Security Boundary**: Operators access elevator state through authenticated backend routes and realtime sessions scoped to authorized buildings and roles. The frontend never authenticates directly to Twin infrastructure.
- **Observability**: The platform must expose logs and metrics for bootstrap attempts, bootstrap duration, bootstrap failures, accepted live events, rejected live events, stale synchronization, degraded sessions, and 3D projection readiness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can load current elevator state for the active building within 5 seconds in the local validation environment when the Twin source is reachable.
- **SC-002**: Accepted live elevator updates are visible in list, detail, and 3D projections within 500 ms in steady-state local validation.
- **SC-003**: Duplicate or out-of-order live events do not create duplicate UI transitions during validation replay.
- **SC-004**: 100% of tested degraded Twin scenarios show an explicit loading, empty, stale, partial, or degraded state instead of a misleading ready state.
- **SC-005**: A tester can complete the documented Twin-to-3D validation flow without starting the AI service.
- **SC-006**: Selecting an elevator from either the list or the 3D scene updates the shared selected elevator context in all tested dashboard panels.

## Assumptions

- The existing backend authentication and building-scope model will be reused.
- The feature targets one active building dashboard for this phase.
- Existing dashboard list, detail, alert, and 3D modules remain the main frontend surfaces.
- AI predictive maintenance is deferred and not required for this phase's done definition.
- Local validation can use real Ditto-compatible services or deterministic test doubles that preserve the same data contract.
