# Feature Specification: 3D Operations Runtime

**Feature Branch**: `[005-3d-operations-runtime]`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Giai đoạn tiếp theo tập trung làm chi tiết phần 3D để dashboard vận hành dùng được tốt hơn."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read Building State in 3D (Priority: P1)

An operator opens the operations dashboard and immediately understands the building's elevator state through a spatial 3D view, not just through lists and badges.

**Why this priority**: The 3D phase only has value if the scene becomes a reliable operational surface. A readable spatial overview is the minimum useful slice.

**Independent Test**: Can be tested by loading a building with multiple elevators in different floors and states, then verifying that an operator can distinguish elevator position, movement state, and degraded state directly from the 3D view without opening detail panels.

**Acceptance Scenarios**:

1. **Given** current elevator state is available for the active building, **When** the operator opens the dashboard, **Then** the 3D view shows one visible representation per elevator in the correct building scope.
2. **Given** elevators are in different floors or states, **When** the operator scans the 3D view, **Then** the view distinguishes their position and operational state without requiring list inspection.
3. **Given** no elevator data is available for the active scope, **When** the operator opens the 3D view, **Then** the scene shows an explicit empty or unavailable state rather than a misleading static layout.

---

### User Story 2 - Inspect and Focus an Elevator Spatially (Priority: P1)

An operator selects an elevator from either the 3D scene or the dashboard list and gets one synchronized inspection context across scene, list, and detail surfaces.

**Why this priority**: Spatial inspection is the main reason to invest in a 3D operations view. Without reliable selection and focus behavior, the scene stays decorative.

**Independent Test**: Can be tested by selecting elevators alternately from the 3D scene and list, then confirming the same elevator remains selected, focused, and described in every relevant surface.

**Acceptance Scenarios**:

1. **Given** the operator selects an elevator in the list, **When** the 3D view is visible, **Then** the same elevator is visually focused in the scene.
2. **Given** the operator selects an elevator in the 3D scene, **When** the detail surface is open, **Then** the detail surface switches to that elevator.
3. **Given** a selected elevator becomes unavailable after resynchronization, **When** the scene updates, **Then** the interface clears or reassigns focus in a predictable way rather than pointing to stale geometry.

---

### User Story 3 - Follow Live Operational Changes in 3D (Priority: P2)

An operator watches live elevator changes in the 3D view and trusts that movement, door state, warning state, and stale state are updated in step with the rest of the dashboard.

**Why this priority**: The 3D view must reflect live operations consistently or it will reduce operator trust instead of improving awareness.

**Independent Test**: Can be tested by replaying accepted live changes for floor movement, direction, door changes, and degraded state, then confirming the 3D view updates in sync with list and detail state.

**Acceptance Scenarios**:

1. **Given** an accepted live change updates an elevator's floor or direction, **When** the backend publishes the update, **Then** the 3D scene reflects the change within the target realtime window.
2. **Given** an elevator changes to maintenance, warning, or fault state, **When** the update reaches the dashboard, **Then** the 3D scene presents a visual state that distinguishes it from normal operation.
3. **Given** the dashboard enters stale or degraded synchronization, **When** the operator remains on the 3D view, **Then** the scene keeps the last accepted state visible and clearly indicates that the state is no longer fully live.

---

### User Story 4 - Operate the Scene Efficiently Under Real Load (Priority: P2)

An operator uses the 3D scene as a working surface during live monitoring without losing responsiveness when many elevators, overlays, or state changes are present.

**Why this priority**: A 3D operations surface that becomes sluggish or cluttered under realistic conditions will not hold up in demos or production-like validation.

**Independent Test**: Can be tested by loading the representative local building dataset, switching focus repeatedly, replaying live updates, and confirming the scene remains responsive and readable without visual overlap that prevents inspection.

**Acceptance Scenarios**:

1. **Given** the active building contains multiple elevators, **When** the operator pans, focuses, or changes selection, **Then** the scene remains responsive and preserves readable labels and overlays.
2. **Given** live updates occur while an elevator is selected, **When** the selected elevator changes state, **Then** the scene updates without losing focus or causing disruptive camera jumps.
3. **Given** the scene is shown on laptop-sized and desktop-sized viewports, **When** the operator uses the 3D surface, **Then** critical 3D controls and overlays remain usable and do not collide with surrounding dashboard content.

### Edge Cases

- An elevator exists in normalized state but lacks a valid floor, direction, or door state for visual projection.
- Multiple elevators occupy adjacent floors and must remain visually distinguishable during rapid updates.
- The selected elevator disappears from the active scope after a resync or scope change.
- Realtime updates arrive while the scene is still initializing or while the camera is mid-transition.
- The dashboard enters stale or degraded state while the operator is focused on a single elevator.
- A dense set of labels, badges, or overlays risks obscuring the cabin or shaft being inspected.
- Viewport size shrinks enough that the scene, overlay, and controls compete for space.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present one spatial 3D representation for each elevator in the active building scope.
- **FR-002**: System MUST derive the 3D representation from the same normalized elevator state used by list and detail surfaces.
- **FR-003**: System MUST make elevator position, movement direction, door state, and health state visually distinguishable in the 3D scene.
- **FR-004**: System MUST keep one synchronized selected elevator context across the dashboard list, detail view, alerts context, and 3D scene.
- **FR-005**: System MUST support selecting an elevator from the 3D scene and from non-3D dashboard surfaces.
- **FR-006**: System MUST preserve or predictably clear selected-elevator focus when bootstrap refresh or realtime resynchronization changes the available elevator set.
- **FR-007**: System MUST reflect accepted live elevator changes in the 3D scene within the same synchronization model used by other dashboard surfaces.
- **FR-008**: System MUST visually distinguish stale, degraded, maintenance, warning, fault, and normal states in the 3D scene.
- **FR-009**: System MUST expose explicit empty or unavailable 3D states when no valid scene data exists for the active scope.
- **FR-010**: System MUST provide operator-usable camera or focus behaviors for overview and selected-elevator inspection.
- **FR-011**: System MUST keep 3D controls, labels, and overlays readable on supported desktop and laptop layouts during local validation.
- **FR-012**: System MUST avoid disruptive scene resets or camera jumps during normal live updates when the building scope is unchanged.
- **FR-013**: Feature MUST read `realtime`, `telemetry`, `config`, and `alarm` data classes only through backend-mediated dashboard state; frontend direct access to Twin infrastructure is not allowed.
- **FR-014**: Feature MUST define authentication scope, synchronization-state behavior, and required observability signals for scene readiness, selection continuity, degraded view state, and rendering performance.
- **FR-015**: Feature MUST support local validation using the existing Ditto-backed runtime without requiring AI predictive maintenance services.

### Key Entities *(include if feature involves data)*

- **3D Elevator Projection**: The scene-level representation of one elevator, including position, selection state, motion state, and degraded indicators.
- **Scene Focus Context**: The operator's current inspection target, including selected elevator, focus mode, and whether the scene is in overview or focused inspection mode.
- **Spatial View State**: The overall scene readiness and interaction state, including empty, loading, ready, stale, and degraded conditions.
- **Overlay Presentation State**: The operator-facing labels, badges, and contextual information attached to selected or highlighted elevators.
- **Normalized Elevator State**: The canonical dashboard elevator state that feeds both 2D and 3D operational surfaces.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: The 3D scene must remain a projection of backend-normalized Twin state rather than an independent source of truth or a hand-authored visual model.
- **Realtime Model**: The scene consumes the same backend-mediated bootstrap and live update stream as other dashboard surfaces, and it must honor stale, reconnecting, and degraded synchronization states.
- **Failure Handling**: When scene data is missing, malformed, stale, or partially unavailable, the operator must see explicit 3D empty or degraded states instead of frozen-looking healthy visuals.
- **Security Boundary**: The 3D feature inherits the existing authenticated, building-scoped backend contract. Scene state is limited to what the operator is authorized to inspect.
- **Observability**: The feature needs signals for scene readiness, scene-empty conditions, projection failures, selection continuity across resync, degraded or stale scene state, and local rendering performance under representative load.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In the representative local building dataset, an operator can identify elevator floor position and operational state for every visible elevator directly from the 3D scene within 10 seconds of page load.
- **SC-002**: Selecting an elevator from either the list or 3D scene updates the shared inspection context in all relevant surfaces within 500 ms during local validation.
- **SC-003**: Accepted live state changes appear in the 3D scene within 500 ms and remain consistent with list and detail views during replay validation.
- **SC-004**: In all tested stale or degraded synchronization scenarios, the 3D surface shows an explicit degraded-state cue while preserving the last accepted elevator projection when available.
- **SC-005**: During representative local validation, repeated selection changes and live updates do not cause scene freezes, infinite re-render loops, or loss of selected-elevator context.
- **SC-006**: On supported laptop and desktop layouts, critical 3D controls and overlays remain usable without overlapping enough to block elevator inspection.

## Assumptions

- The Ditto-backed runtime from phase 4 remains the data source for this phase.
- The active validation building remains `L72` unless another explicit building scope is configured later.
- Existing dashboard list, detail, alert, and realtime flows remain in place and will not be replaced by the 3D scene.
- This phase focuses on operator inspection and monitoring workflows, not predictive maintenance or AI-driven recommendations.
- Validation prioritizes desktop and laptop operations surfaces over mobile-first 3D workflows.
