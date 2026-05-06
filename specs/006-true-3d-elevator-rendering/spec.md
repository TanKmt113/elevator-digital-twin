# Feature Specification: True 3D Elevator Rendering

**Feature Branch**: `[006-true-3d-elevator-rendering]`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Hãy làm phần 006 để render cho tôi 3D của thang máy đi"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the Building in True 3D (Priority: P1)

An operator opens the dashboard and sees elevator shafts, cabins, and floors in a true spatial scene instead of flat cards that only simulate spatial layout.

**Why this priority**: This is the core value of phase 006. Without true 3D rendering, the phase does not deliver a meaningful step beyond phase 005.

**Independent Test**: Can be tested by loading the seeded local building dataset and confirming that each in-scope elevator appears as a cabin within a shaft, at the correct floor height, in a stable overview scene.

**Acceptance Scenarios**:

1. **Given** current elevator state is available for the active building, **When** the operator opens the dashboard, **Then** the scene shows one 3D cabin per elevator within a readable building layout.
2. **Given** elevators are on different floors, **When** the operator views the scene in overview mode, **Then** cabin heights visibly differ according to floor position.
3. **Given** no valid elevators exist for the active scope, **When** the operator opens the 3D surface, **Then** the interface shows an explicit empty or unavailable 3D state instead of a misleading healthy scene.

---

### User Story 2 - Inspect One Elevator with Real Camera Focus (Priority: P1)

An operator selects an elevator from either the dashboard list or the 3D scene and sees the camera and scene focus shift to that elevator without losing context.

**Why this priority**: True 3D becomes operationally useful only when the operator can inspect one elevator spatially and reliably.

**Independent Test**: Can be tested by selecting elevators alternately from the list and scene, then confirming the selected cabin becomes the clear camera focus while shared detail context stays synchronized.

**Acceptance Scenarios**:

1. **Given** an elevator is selected from the list, **When** the 3D scene is visible, **Then** the selected cabin becomes the active spatial focus in the scene.
2. **Given** an elevator is selected directly in the 3D scene, **When** the detail surface is shown, **Then** the same elevator becomes the shared inspection target.
3. **Given** the operator returns to overview mode, **When** the camera resets, **Then** the scene returns to a predictable building-wide view without losing the currently selected elevator identity.

---

### User Story 3 - Watch Live Cabin Movement and Door State in 3D (Priority: P2)

An operator watches accepted live updates and sees cabin position, motion direction, and door state change in the 3D scene in step with the rest of the dashboard.

**Why this priority**: A true 3D scene that does not move with live state will look impressive but reduce operator trust.

**Independent Test**: Can be tested by replaying accepted live elevator changes and confirming that cabin location, motion cues, and door cues update in the scene within the same operational window as the list and detail surfaces.

**Acceptance Scenarios**:

1. **Given** an accepted live state changes an elevator floor, **When** the update is applied, **Then** the cabin changes position in the 3D scene to match the accepted floor.
2. **Given** an elevator changes door or movement state, **When** the update is displayed, **Then** the scene visually distinguishes that state from an idle closed-door cabin.
3. **Given** the dashboard becomes stale or degraded, **When** the operator remains on the 3D scene, **Then** the last accepted 3D state remains visible with an explicit stale or degraded cue.

---

### User Story 4 - Operate the 3D Scene Smoothly Under Local Validation Load (Priority: P2)

An operator uses the true 3D scene repeatedly during live monitoring without losing responsiveness or creating disorienting camera behavior.

**Why this priority**: If the scene becomes sluggish, jittery, or visually unstable, the value of true 3D is lost in real use.

**Independent Test**: Can be tested by loading the representative local building dataset, switching focus repeatedly, replaying live updates, and confirming that the scene remains readable, responsive, and stable on supported laptop and desktop layouts.

**Acceptance Scenarios**:

1. **Given** the active building contains multiple elevators, **When** the operator switches focus repeatedly, **Then** the scene remains responsive and preserves understandable camera behavior.
2. **Given** live updates occur while one elevator is selected, **When** the cabin state changes, **Then** the scene updates without disruptive camera resets or uncontrolled motion.
3. **Given** the dashboard is shown on supported laptop and desktop layouts, **When** the operator uses the 3D scene, **Then** critical controls and overlays remain usable and do not block cabin inspection.

### Edge Cases

- Elevator state exists but floor or direction is missing, malformed, or outside the expected building range.
- Multiple adjacent elevators move or update nearly simultaneously and must remain visually distinct.
- A selected elevator disappears after resynchronization and the camera must recover predictably.
- Scene initialization completes before all projected cabins are ready, creating a partial render window.
- The dashboard enters stale or degraded state while the camera is focused tightly on one elevator.
- Repeated focus switching creates rapid camera transitions that risk disorienting the operator.
- The active scene is readable on desktop but becomes cramped on narrower laptop layouts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present one true 3D cabin representation for each elevator in the active building scope.
- **FR-002**: System MUST present building floors and shafts in a spatial layout that allows an operator to interpret cabin height and relative position.
- **FR-003**: System MUST derive 3D cabin placement from the same normalized elevator state used by list and detail surfaces.
- **FR-004**: System MUST visually distinguish at least idle, moving, door-open, maintenance, fault, stale, degraded, and unavailable elevator states in the 3D scene.
- **FR-005**: System MUST support selecting an elevator from the dashboard list and from the 3D scene itself.
- **FR-006**: System MUST maintain one shared inspection context across list, detail, alerts context, and the 3D scene.
- **FR-007**: System MUST provide a predictable overview mode and a predictable selected-elevator focus mode for the 3D camera.
- **FR-008**: System MUST preserve or predictably recover selection and camera focus across bootstrap refresh and realtime resynchronization.
- **FR-009**: System MUST reflect accepted live floor, motion, and door-state changes in the 3D scene within the same synchronization model used by the rest of the dashboard.
- **FR-010**: System MUST expose explicit empty, loading, stale, and degraded scene states when a fully live 3D view is not available.
- **FR-011**: System MUST keep the 3D scene usable on supported laptop and desktop layouts without critical controls or overlays blocking inspection.
- **FR-012**: Feature MUST read `realtime`, `telemetry`, `config`, and `alarm` data classes only through backend-mediated dashboard state; frontend direct access to Twin infrastructure is not allowed.
- **FR-013**: Feature MUST specify the backend-mediated bootstrap and live-update paths used by the 3D renderer and reuse the existing authenticated building scope.
- **FR-014**: Feature MUST define observability signals for scene readiness, missing geometry, selection continuity, stale or degraded 3D state, and local render responsiveness.
- **FR-015**: Feature MUST support local validation using the existing Ditto-backed runtime without requiring AI predictive maintenance services.

### Key Entities *(include if feature involves data)*

- **3D Cabin Projection**: The visual representation of one elevator cabin in true 3D space, including floor-derived position, motion cues, door cues, and health or degraded indicators.
- **3D Building Scene**: The operator-facing spatial layout that contains floors, shafts, cabins, shared lighting or view context, and scene-level readiness state.
- **Camera Focus Context**: The current scene viewpoint mode, including overview or selected-elevator focus behavior, transition expectations, and selection continuity rules.
- **Shared Elevator Inspection Context**: The single selected-elevator identity used across list, detail, alert, and 3D surfaces.
- **Scene Runtime State**: The governed scene condition including loading, ready, empty, stale, degraded, and unavailable behavior.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: The true 3D scene remains a projection of backend-normalized Twin state and does not invent elevator truth outside accepted dashboard state.
- **Realtime Model**: The 3D renderer consumes the same backend-mediated bootstrap and live-update stream as the rest of the dashboard and must honor stale, degraded, reconnecting, and resync behavior.
- **Failure Handling**: Missing geometry, malformed elevator values, partial update windows, and downstream failures must result in explicit empty, partial, stale, or degraded operator-facing states instead of a frozen-looking healthy scene.
- **Security Boundary**: The feature inherits the existing JWT-based, building-scoped backend contract. The 3D scene must only expose elevators and state already authorized for the operator.
- **Observability**: The feature needs signals for scene initialization, projection success or failure, camera focus transitions, selected-elevator continuity, stale or degraded runtime state, and local render responsiveness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In the representative local building dataset, an operator can identify the relative floor position of every visible elevator cabin from the true 3D scene within 10 seconds of page load.
- **SC-002**: Selecting an elevator from either the list or the 3D scene updates the shared inspection context and active camera focus within 500 ms during local validation.
- **SC-003**: Accepted live floor and door-state changes appear in the 3D scene within 500 ms and remain consistent with list and detail state during replay validation.
- **SC-004**: In all tested stale or degraded synchronization scenarios, the 3D surface preserves the last accepted scene state when available and presents an explicit stale or degraded cue.
- **SC-005**: During representative local validation, repeated focus changes and live updates do not cause render loops, frozen frames longer than 1 second, or loss of selected-elevator context.
- **SC-006**: On supported laptop and desktop layouts, critical 3D controls and overlays remain usable without obscuring the selected cabin for more than 2 seconds during normal interaction.

## Assumptions

- Phase 005 scene-state, selection, and degraded-runtime contracts remain the behavioral foundation for phase 006.
- The active validation building remains `L72` unless another explicit building scope is configured later.
- Existing dashboard list, detail, alert, and realtime flows remain in place and are not replaced by the 3D scene.
- This phase focuses on true 3D operator inspection and live monitoring, not predictive maintenance or AI-generated guidance.
- Validation continues to prioritize desktop and laptop operation rather than mobile-first 3D workflows.
