# Feature Specification: Enhanced Elevator Digital Twin

**Feature Branch**: `[008-enhanced-elevator-twin]`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Write Spec Kit documentation to implement all enhanced elevator Digital Twin items: richer Twin data model, backend-mediated Ditto mapping, detailed 3D scene, realtime interpolation, historical playback, operator detail workflows, controls, observability, validation, and failure handling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Rich Elevator State (Priority: P1)

An operator views a selected elevator and sees a complete operational state, not only floor and direction. The view includes continuous cabin position, door percentage, load, mode, motor/brake/controller signals, fault details, call queue, ETA, and freshness indicators.

**Why this priority**: The detailed Digital Twin must first expose reliable operational truth before richer visuals or workflows can be trusted.

**Independent Test**: Can be tested by bootstrapping the representative L72 elevator dataset and confirming that list, detail, and raw inspection surfaces show the same expanded state for every in-scope elevator.

**Acceptance Scenarios**:

1. **Given** an elevator has complete enhanced Twin data, **When** the operator opens its detail view, **Then** all expanded operational, telemetry, fault, and call fields are visible with clear labels and units.
2. **Given** an elevator has only partial enhanced Twin data, **When** the operator opens its detail view, **Then** available fields are shown and missing fields are marked unknown without implying healthy data.
3. **Given** an update changes a single field such as door percentage or load, **When** the backend accepts the update, **Then** the detail view reflects that field without requiring a full page reload.

---

### User Story 2 - View a More Faithful 3D Twin (Priority: P1)

An operator sees cabins, shafts, floors, doors, movement indicators, health cues, and selected elevator focus represented spatially in the 3D scene using the same enhanced Twin state.

**Why this priority**: The primary product value is an operational Digital Twin that communicates elevator behavior spatially and accurately.

**Independent Test**: Can be tested by loading a seeded building with multiple elevator states and confirming cabins are placed in configured shafts, move to continuous positions, and show door, direction, health, stale, and degraded cues.

**Acceptance Scenarios**:

1. **Given** configured shaft and floor metadata exists, **When** the 3D scene renders, **Then** each cabin appears in its configured shaft at a position derived from continuous location or current floor fallback.
2. **Given** door percentage changes, **When** the 3D scene updates, **Then** door visuals reflect the percentage rather than only open or closed labels.
3. **Given** an elevator enters maintenance, fault, stale, or degraded state, **When** the scene updates, **Then** the cabin and related overlay make the condition visible without hiding the last accepted position.

---

### User Story 3 - Watch Smooth Live Movement (Priority: P2)

An operator watches accepted live updates and sees cabin movement, door motion, load, mode, and fault cues update smoothly across dashboard panels and 3D surfaces.

**Why this priority**: Live monitoring loses trust if the 3D scene jumps, lags behind the list, or contradicts the detail panel.

**Independent Test**: Can be tested by replaying accepted live changes that include floor, continuous position, door percentage, movement mode, load, and fault fields, then verifying all dashboard surfaces converge within the required realtime window.

**Acceptance Scenarios**:

1. **Given** two accepted position updates arrive for the same elevator, **When** the scene renders between them, **Then** the cabin interpolates predictably without overshooting or camera resets.
2. **Given** a partial Ditto merge event arrives, **When** it is accepted, **Then** backend state remains complete and the frontend receives one normalized event with the latest full elevator projection.
3. **Given** events are duplicated, out of order, out of scope, or malformed, **When** they are received, **Then** the visible Twin does not regress and rejection counters identify the reason.

---

### User Story 4 - Replay and Diagnose Recent Operation (Priority: P2)

An operator reviews recent elevator movement and state changes to understand what happened before a fault, service mode change, or passenger-impacting event.

**Why this priority**: Detailed Digital Twin value increases when operators can compare the current state with recent history.

**Independent Test**: Can be tested by ingesting a short replayable telemetry sequence and confirming the operator can scrub a timeline, inspect state at a selected time, and return to live mode.

**Acceptance Scenarios**:

1. **Given** recent enhanced state history exists, **When** the operator opens playback for an elevator, **Then** the timeline shows position, door, load, mode, and fault changes in chronological order.
2. **Given** the operator scrubs to a past timestamp, **When** playback mode is active, **Then** list, detail, and 3D context clearly indicate historical mode and do not pretend to be live.
3. **Given** history is missing or partially available, **When** playback is opened, **Then** the operator sees the available range and a clear partial-data message.

---

### User Story 5 - Use Operator Controls Safely (Priority: P3)

An authorized operator can initiate or simulate allowed elevator commands from the detailed Twin workflow while preserving policy checks, auditability, and clear command lifecycle feedback.

**Why this priority**: Controls are useful only after state, visualization, and history are reliable.

**Independent Test**: Can be tested by attempting allowed and disallowed commands against seeded elevators and confirming policy, audit, command status, and UI feedback behave correctly.

**Acceptance Scenarios**:

1. **Given** an operator has permission for the building and command, **When** they submit a supported command such as call elevator or set service mode, **Then** the command is validated, audited, and shown with lifecycle status.
2. **Given** an operator lacks permission or the elevator state forbids the command, **When** they submit it, **Then** no unsafe command is issued and a clear rejection reason is shown.
3. **Given** command execution is delayed or fails, **When** the operator watches the detail view, **Then** pending, accepted, failed, and timed-out states remain visible without corrupting live Twin state.

### Edge Cases

- Enhanced fields are missing, null, malformed, out of physical range, or have unknown enum values.
- Ditto sends partial merge events that omit building scope or unchanged fields.
- Live updates arrive late, duplicated, out of order, or with schema mismatches.
- Continuous position conflicts with current floor, target floor, or configured shaft metadata.
- The selected elevator disappears after bootstrap refresh or resync.
- Realtime delivery is live but data becomes stale because no accepted elevator update arrived within the freshness window.
- History exists for some fields but not others.
- Multiple adjacent elevators move at the same time and must remain visually distinct.
- A command is submitted while the elevator is stale, degraded, in fault, or in maintenance mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain an expanded elevator Twin state including discrete floor state, continuous position, motion, door, load, service mode, machine state, telemetry, fault, call queue, ETA, and freshness metadata.
- **FR-002**: System MUST preserve the current normalized elevator state as the single source used by list, detail, alerts, history, commands, and 3D scene projections.
- **FR-003**: System MUST accept full and partial Twin updates while keeping materialized backend state complete enough for building scope checks and frontend projection.
- **FR-004**: System MUST validate and normalize enhanced values, including units, physical ranges, enums, timestamps, and unknown fallbacks.
- **FR-005**: System MUST render each elevator in a configured 3D shaft and floor layout using continuous position when available and floor-derived fallback otherwise.
- **FR-006**: System MUST show door percentage, movement direction, target floor, load, service mode, health, stale, degraded, maintenance, and fault states in the 3D scene.
- **FR-007**: System MUST support smooth cabin and door interpolation for accepted live updates without inventing state beyond the latest accepted Twin data.
- **FR-008**: System MUST provide a detailed elevator inspection workflow with sections for state, telemetry, calls, faults, maintenance, history, and commands.
- **FR-009**: System MUST support recent historical playback for enhanced elevator state and clearly distinguish playback mode from live mode.
- **FR-010**: System MUST keep shared elevator selection consistent across list, detail, alerts, commands, history, and 3D scene.
- **FR-011**: System MUST support safe operator commands only through existing policy, authorization, audit, and command lifecycle controls.
- **FR-012**: System MUST reject or quarantine malformed, out-of-scope, duplicate, out-of-order, unsafe, or unsupported updates without regressing visible state.
- **FR-013**: Feature MUST define reads and writes for `realtime`, `telemetry`, `config`, and `alarm` data classes and identify canonical Twin entities involved.
- **FR-014**: Feature MUST use backend-mediated API and realtime event paths only; frontend direct access to Ditto or device infrastructure is not allowed.
- **FR-015**: Feature MUST define authentication, authorization scope, command policy, audit, logs, metrics, and trace correlation for critical flows.
- **FR-016**: System MUST provide explicit loading, empty, partial, stale, degraded, playback, and unavailable states for detailed Twin surfaces.
- **FR-017**: System MUST include local validation paths that prove bootstrap, live partial updates, 3D projection, playback, command rejection, and degraded behavior.

### Key Entities *(include if feature involves data)*

- **Enhanced Elevator Twin**: Complete accepted state for one elevator, including identity, scope, position, motion, door, load, mode, machine, telemetry, fault, calls, ETA, freshness, and synchronization metadata.
- **Building Shaft Layout**: Configured floor and shaft geometry used to place cabins, doors, labels, and camera focus.
- **3D Cabin Projection**: Render-ready projection of an enhanced elevator Twin into spatial position, visual state, animation target, labels, and operator cues.
- **Telemetry Sample**: Timestamped operational measurement such as speed, temperature, power, vibration, load, or door percentage.
- **Fault Event**: Timestamped fault or warning condition with code, severity, affected subsystem, current state, and acknowledgment state.
- **Call Queue State**: Current requested stops, direction calls, destination calls, assigned car state, and estimated arrival.
- **Playback Snapshot**: Historical state frame used to render a past moment without mutating live accepted state.
- **Operator Command Request**: Requested action, actor, scope, policy result, lifecycle status, audit metadata, and optional target parameters.
- **Synchronization Health**: Per-elevator and scene-level readiness, freshness, rejection counters, delivery state, and degraded reason.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: Ditto-backed Twin state remains authoritative for live elevator truth. The backend materialized state is a normalized projection of accepted Twin updates and is the only state consumed by frontend surfaces.
- **Realtime Model**: Backend consumes Ditto bootstrap and live events, hydrates partial updates when needed, normalizes expanded state, rejects invalid events, and publishes governed realtime events to authorized frontend sessions. Reconnect and resync must preserve last accepted state and repair partial gaps through backend refresh.
- **Failure Handling**: Missing fields, partial history, malformed events, stale delivery, command failure, and rendering limitations must produce explicit partial, stale, degraded, or unavailable states instead of blank or misleading healthy views.
- **Security Boundary**: Existing JWT-based building scope and role policy remain mandatory. Commands require backend authorization, command policy checks, audit records, and lifecycle feedback before any state-affecting action is exposed.
- **Observability**: Required signals include bootstrap and hydration results, partial-update hydration failures, normalization rejects, per-field freshness, scene projection failures, interpolation lag, playback data gaps, command lifecycle outcomes, active sessions, and correlation IDs from Ditto through frontend delivery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For the representative L72 dataset, an operator can identify current floor, continuous position, door percentage, load, mode, and fault state for any visible elevator within 10 seconds of dashboard readiness.
- **SC-002**: Accepted enhanced live updates are visible in list, detail, and 3D scene within 500 ms during local validation.
- **SC-003**: Partial Ditto merge events that contain only changed fields still result in complete accepted frontend elevator projections for in-scope elevators.
- **SC-004**: 3D cabin and door interpolation remains stable during repeated live updates, with no visible jump larger than one configured floor interval unless the accepted Twin state itself jumps.
- **SC-005**: Playback mode can render at least the last 5 minutes of representative local state changes when history exists, and reports partial availability when it does not.
- **SC-006**: Invalid, duplicate, out-of-order, out-of-scope, and malformed updates do not regress the displayed elevator state and are counted by rejection category.
- **SC-007**: Unsupported or unauthorized commands are rejected before execution and produce an auditable operator-facing reason.
- **SC-008**: Stale or degraded Twin delivery is visible within 2 seconds of threshold breach while preserving the last accepted detailed state.

## Assumptions

- The active validation scope remains building `L72` and the existing local Ditto stack remains the primary validation source.
- The feature extends the current backend-mediated dashboard architecture instead of replacing it.
- Existing React, Three.js, Zustand, Express, WebSocket, and Vitest foundations remain available.
- AI predictive scoring is optional and not required for the enhanced Digital Twin MVP.
- Historical playback can initially use bounded recent in-memory or existing local persistence before long-term analytics storage is hardened.
- Commands may be simulated or policy-gated locally unless a safe real device integration is explicitly configured later.
