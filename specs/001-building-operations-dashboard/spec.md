# Feature Specification: Smart Building Operations Dashboard

**Feature Branch**: `[001-building-operations-dashboard]`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Smart Building Digital Twin Dashboard cho Keangnam Landmark 72 với giám sát thiết bị realtime, điều khiển vận hành thang máy, cảnh báo, 3D Twin, lịch sử, và AI cảnh báo sớm."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Monitor Elevators in Real Time (Priority: P1)

As an operator, I need to see the live state of every elevator so I can detect
movement, faults, and unsafe conditions immediately without changing screens or
reloading the dashboard.

**Why this priority**: Continuous visibility is the operational core of the
platform and is the foundation for all response, control, and maintenance work.

**Independent Test**: Can be fully tested by simulating live elevator state
changes and confirming an operator can identify current floor, direction, door
state, load, and fault state from one dashboard view.

**Acceptance Scenarios**:

1. **Given** an operator is viewing the elevator dashboard, **When** elevator
   state changes occur, **Then** the dashboard updates the affected elevator
   state without a page reload and shows the latest floor, direction, door
   state, load, and operating status.
2. **Given** one elevator enters a fault state, **When** the fault event is
   received, **Then** the operator can immediately distinguish that elevator
   from normal elevators and open its detail view.

---

### User Story 2 - Issue Safe Elevator Commands (Priority: P1)

As an operator, I need to send approved elevator commands through the platform
so I can support operations without direct device access.

**Why this priority**: Controlled command execution is the core operational
action beyond monitoring and must stay within the platform’s governance model.

**Independent Test**: Can be fully tested by selecting an elevator, sending
   allowed commands, and confirming the platform returns immediate feedback,
   records the action, and blocks commands that violate business rules.

**Acceptance Scenarios**:

1. **Given** an operator selects an eligible elevator, **When** the operator
   sends a move, stop, or reset command, **Then** the platform confirms receipt
   immediately and updates the command outcome when processing completes.
2. **Given** an elevator is in a severe fault state, **When** an operator tries
   to send a restricted command, **Then** the platform rejects the action and
   explains why the command is blocked.

---

### User Story 3 - Understand Building State Through 3D Twin View (Priority: P2)

As an operator, I need a 3D representation of the building and elevator
positions so I can interpret asset state spatially and drill into issues
faster.

**Why this priority**: Spatial context improves situational awareness but is
less critical than baseline monitoring and safe control.

**Independent Test**: Can be fully tested by opening the 3D view, observing
live elevator position and status changes, and opening a detail panel from a
selected object.

**Acceptance Scenarios**:

1. **Given** the 3D view is open, **When** an elevator changes floor or status,
   **Then** the model reflects the new position and visually distinguishes
   normal and fault states.
2. **Given** an operator points to or selects an elevator in the 3D view,
   **When** the interaction occurs, **Then** the object is highlighted and the
   relevant detail panel opens.

---

### User Story 4 - Respond to Alerts Quickly (Priority: P1)

As an operator or maintenance technician, I need to receive and acknowledge
alerts immediately so I can triage incidents and coordinate follow-up action.

**Why this priority**: Real-time alerting directly affects safety, downtime,
and response speed.

**Independent Test**: Can be fully tested by generating supported alert types
and confirming they appear with severity, message, detail access, and
acknowledgement tracking.

**Acceptance Scenarios**:

1. **Given** an overload, overheating, stuck elevator, or emergency stop event
   occurs, **When** the platform receives it, **Then** the alert appears in the
   dashboard immediately with the correct severity and message.
2. **Given** a user with alert permissions opens the alert panel, **When** the
   user acknowledges an alert, **Then** the platform records who acknowledged it
   and updates the alert state for other authorized users.

---

### User Story 5 - Review History and Operational Trends (Priority: P2)

As an admin or maintenance user, I need to review historical activity and filter
device records so I can investigate incidents and operating patterns.

**Why this priority**: Historical visibility improves diagnosis and reporting
but depends on core monitoring and alert flows already being trustworthy.

**Independent Test**: Can be fully tested by retrieving historical movement and
activity data for selected devices and time windows and confirming the results
match recorded events.

**Acceptance Scenarios**:

1. **Given** a user selects a device and time range, **When** the user requests
   history, **Then** the platform shows movement history, activity counts, and
   relevant alert history for the selected scope.
2. **Given** the selected filter has no matching records, **When** the history
   view loads, **Then** the platform shows an empty-state message without
   implying data loss.

---

### User Story 6 - Surface Early Risk Warnings (Priority: P3)

As a maintenance user or admin, I need early risk warnings based on operating
patterns so I can act before a likely elevator failure becomes an outage.

**Why this priority**: Predictive insights create strong business value but
depend on the operational data foundation delivered by earlier stories.

**Independent Test**: Can be fully tested by presenting elevated risk results
for a selected elevator and confirming the dashboard shows the warning, risk
level, and recommended attention window.

**Acceptance Scenarios**:

1. **Given** the platform identifies elevated failure risk for an elevator,
   **When** an authorized user views that elevator, **Then** the platform shows
   the early warning, relative risk level, and expected attention timeframe.
2. **Given** no elevated risk exists for a monitored period, **When** a user
   opens the predictive view, **Then** the platform clearly shows that no early
   warning is active.

### Edge Cases

- A device stops sending updates while its last known state is still visible.
- Duplicate or out-of-order events arrive for the same elevator state change.
- A command is accepted for processing but cannot be completed downstream.
- An alert arrives for a device that is temporarily unavailable in the current
  operator view.
- Historical data is incomplete for part of the selected time window.
- Predictive risk exists while the source telemetry quality is degraded.
- A user loses authorization during an active session and tries to continue
  viewing or controlling protected resources.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single operational dashboard for
  elevator monitoring in Keangnam Landmark 72 with live visibility of current
  floor, direction, door state, load, and operating status for each elevator.
- **FR-002**: The system MUST update live elevator state without page reloads
  and MUST present new operational changes to authorized users within the
  defined success criteria.
- **FR-003**: The system MUST allow authorized operators to select an elevator
  and submit supported control commands for move, stop, and reset actions.
- **FR-004**: The system MUST provide immediate user feedback when a command is
  submitted and MUST later show whether the command succeeded, failed, or was
  rejected by policy.
- **FR-005**: The system MUST block restricted commands when an elevator is in
  a severe fault state and MUST explain the reason for the denial to the user.
- **FR-006**: The system MUST provide a 3D building view that shows elevator
  position by floor, reflects status changes visually, and supports select and
  hover interactions that reveal additional detail.
- **FR-007**: The system MUST present alerts for overload, motor overheating,
  stuck elevator, and emergency stop conditions with severity, message detail,
  and acknowledgement capability for authorized users.
- **FR-008**: The system MUST classify overload and motor fault conditions as
  critical and high-temperature conditions as warning severity unless a stricter
  policy is defined by building operations.
- **FR-009**: The system MUST retain historical movement, alert, and activity
  records and allow authorized users to filter them by time range and device.
- **FR-010**: The system MUST surface early-risk warnings for elevators when
  risk analysis indicates likely upcoming failure and MUST display a relative
  risk level and suggested attention window.
- **FR-011**: The feature MUST define whether it reads or writes `realtime`,
  `telemetry`, `config`, and `alarm` data classes and identify the canonical
  Twin entities involved.
- **FR-012**: The feature MUST use only backend-mediated dashboard views,
  command paths, and realtime streams; no user-facing experience may access
  device interfaces or Twin infrastructure directly.
- **FR-013**: The feature MUST require authenticated access and MUST enforce
  role-based authorization for operator, admin, and maintenance users at the
  building and device scope.
- **FR-014**: The system MUST log every control command and alert
  acknowledgement with actor, target asset, timestamp, and outcome for audit
  review.
- **FR-015**: The system MUST provide an operational summary showing at least
  the total number of elevators, active elevators, and elevators in fault state.

### Key Entities *(include if feature involves data)*

- **Elevator Twin**: Canonical representation of one elevator’s current state,
  health, configuration references, and control eligibility.
- **Elevator Event**: Time-stamped operational record describing state changes,
  telemetry changes, commands, or alerts related to an elevator.
- **Control Command**: Authorized request to perform an operational action on an
  elevator, including requested action, issuer, status, and audit outcome.
- **Alert**: Detected abnormal condition with severity, message, acknowledgement
  state, and related asset context.
- **Historical Record**: Filterable collection of past elevator movements,
  events, alerts, and activity totals for analysis and reporting.
- **Risk Warning**: Predictive maintenance insight containing the target asset,
  risk level, supporting factors, and expected attention window.
- **User Role Assignment**: Authorization mapping that determines which users
  can monitor, control, acknowledge, and review assets by scope.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: The feature treats the Digital Twin as the sole
  operational source for live asset state, historical interpretation, and
  approved downstream analysis.
- **Realtime Model**: The feature consumes push-based operational changes and
  command outcomes, updates operator views continuously, and restores live
  visibility after temporary connection interruptions.
- **Failure Handling**: The feature shows last known state with explicit stale
  indicators, rejects unsafe actions, and continues presenting unaffected assets
  when part of the building data flow is degraded.
- **Security Boundary**: Users must sign in before access, and permissions are
  enforced by role and asset scope so unauthorized users cannot view protected
  devices or issue commands.
- **Observability**: The feature requires auditable command records, alert and
  state-change history, user-action traceability, and operational measures for
  live update timeliness, asset availability, and error conditions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In normal operations, 95% of elevator state changes are visible to
  authorized users within 1 second of platform receipt.
- **SC-002**: Operators can identify which elevators are running normally and
  which are faulted within 30 seconds of opening the main dashboard.
- **SC-003**: 95% of valid control command submissions provide user-visible
  acknowledgement within 2 seconds and final outcome visibility within 10
  seconds.
- **SC-004**: 95% of critical alerts appear to authorized users within 5
  seconds of platform receipt.
- **SC-005**: Authorized users can retrieve filtered historical records for a
  selected elevator and time window in under 10 seconds for standard operating
  ranges.
- **SC-006**: At least 90% of acknowledged alerts include a recorded user,
  timestamp, and disposition suitable for audit review.

## Assumptions

- The initial scope focuses on elevator operations as the first building domain,
  while the broader building platform will expand later to HVAC, energy,
  security, and other assets.
- The platform will use existing authenticated building user accounts or an
  equivalent enterprise identity source rather than introducing anonymous use.
- Command execution remains supervisory through the building platform and never
  replaces or bypasses the underlying elevator control system.
- Predictive warnings are advisory decisions for maintenance planning and do not
  automatically trigger physical control actions.
- Standard operating ranges for historical queries are business-day to
  multi-week investigation windows rather than unrestricted archival analytics.
