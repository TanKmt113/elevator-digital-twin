# Feature Specification: Ditto Realtime Synchronization

**Feature Branch**: `[007-ditto-realtime-sync]`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Hãy viết tài liệu 007 để làm phần realtime này cho tôi theo chuẩn speckit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reflect Live Twin Changes In The Dashboard (Priority: P1)

An operator keeps the dashboard open and sees elevator state changes appear automatically after the corresponding Twin data changes in Ditto.

**Why this priority**: The current runtime only becomes operationally useful when the dashboard reflects live Twin changes without requiring a page refresh.

**Independent Test**: Start the local stack, load the dashboard once, change an elevator's Twin state in Ditto, and confirm the list, detail panel, summary, and 3D scene update without a manual reload.

**Acceptance Scenarios**:

1. **Given** the dashboard has already loaded current elevator state, **When** a valid change for an in-scope elevator is applied in Ditto, **Then** the dashboard updates the affected elevator automatically.
2. **Given** multiple operators are viewing the same building scope, **When** Ditto accepts a valid state change, **Then** every connected dashboard session receives the same updated state.
3. **Given** an operator is focused on a selected elevator in the 3D scene, **When** that elevator changes in Ditto, **Then** the focused list, detail, and 3D views stay synchronized to the same accepted state.

---

### User Story 2 - Reject Invalid Or Irrelevant Live Events Safely (Priority: P1)

An operator is protected from misleading motion, stale jumps, or cross-building noise when Twin updates arrive late, duplicated, malformed, or outside the authorized building scope.

**Why this priority**: Realtime data is only trustworthy if the system can distinguish accepted operational changes from events that should not alter the UI.

**Independent Test**: Replay valid, duplicate, out-of-order, malformed, and out-of-scope Twin changes and confirm that only accepted events update the dashboard while rejected events are observable through health or logs.

**Acceptance Scenarios**:

1. **Given** a duplicate live change arrives, **When** the backend evaluates it, **Then** the duplicate is rejected and the dashboard does not replay the same transition again.
2. **Given** a late or out-of-order change arrives for an elevator, **When** a newer accepted state already exists, **Then** the older change is rejected and the dashboard remains on the latest accepted state.
3. **Given** a live change belongs to another building or lacks the required scope identity, **When** it reaches the backend, **Then** the change is not delivered to the active dashboard scope.

---

### User Story 3 - Recover Cleanly From Realtime Interruptions (Priority: P2)

An operator can continue monitoring with clear status feedback when live delivery is interrupted, and the dashboard resynchronizes once connectivity returns.

**Why this priority**: Operators need explicit stale, reconnecting, and degraded behavior instead of silent freezes when Twin or client delivery breaks.

**Independent Test**: Disconnect Twin live delivery or client realtime delivery while the dashboard is open, then restore connectivity and verify stale status appears, last accepted state remains visible, and the dashboard resynchronizes automatically.

**Acceptance Scenarios**:

1. **Given** live delivery stops after the dashboard is ready, **When** no newer accepted state arrives within the stale threshold, **Then** the dashboard shows stale or degraded synchronization while preserving the last accepted elevator state.
2. **Given** realtime connectivity returns after an interruption, **When** the dashboard resynchronizes, **Then** current accepted state is restored without clearing operator context unnecessarily.
3. **Given** the realtime client cannot re-establish authorized delivery, **When** recovery attempts fail, **Then** the dashboard shows a clear degraded state and does not present silent live monitoring.

---

### User Story 4 - Validate Realtime Flow In Local Development (Priority: P2)

A developer can run a documented local validation flow that proves realtime Twin-to-dashboard propagation works and exposes the main failure modes.

**Why this priority**: The feature needs a repeatable local demo and troubleshooting path so the realtime contract can be validated outside unit tests.

**Independent Test**: Follow the quickstart from a clean local environment, open the dashboard, change Ditto data, observe live updates, then simulate interruption and recovery.

**Acceptance Scenarios**:

1. **Given** the local runtime is started with a seeded building dataset, **When** the developer changes an elevator state in Ditto, **Then** the dashboard updates within the expected live window.
2. **Given** the local runtime is healthy, **When** the developer opens a second dashboard session, **Then** both sessions reflect the same accepted Twin changes.
3. **Given** a developer intentionally interrupts Twin or realtime delivery, **When** the dashboard remains open, **Then** the documented health signals make the failure source identifiable.

### Edge Cases

- Live Twin changes arrive before the initial bootstrap has completed.
- Twin changes omit the building identifier, elevator identifier, or event time needed for ordering and scope decisions.
- The same elevator receives rapid sequential updates while one or more client sessions reconnect.
- A client reconnects after missing accepted changes and needs a reliable resynchronization path.
- One building scope is healthy while another scope has no authorized live data.
- Twin live delivery is healthy but backend-to-browser delivery is unavailable, or the reverse.
- A selected 3D elevator is removed from active scope during a resynchronization cycle.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST consume live elevator state changes from the Digital Twin after initial bootstrap completes.
- **FR-002**: System MUST normalize accepted live Twin changes into the governed elevator state used by dashboard REST, summary, list, detail, and 3D surfaces.
- **FR-003**: System MUST deliver accepted live state changes to all authorized dashboard sessions for the affected building scope without requiring page reload.
- **FR-004**: System MUST preserve a single backend-mediated authority boundary; frontend clients MUST NOT connect directly to Twin infrastructure.
- **FR-005**: System MUST reject duplicate, out-of-order, malformed, and out-of-scope live Twin changes from altering dashboard state.
- **FR-006**: System MUST preserve the last accepted elevator state during stale, reconnecting, or degraded delivery conditions when such state exists.
- **FR-007**: System MUST expose synchronization status that distinguishes connecting, live, stale, reconnecting, and degraded runtime conditions to clients.
- **FR-008**: System MUST provide a resynchronization path so clients can recover current accepted elevator state after reconnect or missed delivery.
- **FR-009**: System MUST maintain authorized building scope for both initial state and live delivery so one building's changes are not shown to another building's operators.
- **FR-010**: System MUST keep dashboard surfaces synchronized so a single accepted change appears consistently across list, detail, summary, and 3D views.
- **FR-011**: System MUST make realtime failure causes observable through health, logs, or metrics for Twin ingestion, backend delivery, and client connectivity.
- **FR-012**: System MUST define a repeatable local validation flow for accepted live changes, rejected events, interrupted delivery, and recovery behavior.
- **FR-013**: Feature MUST read and write `realtime` elevator state and MAY read `config` data needed for building scope and elevator identity. It MUST NOT require `telemetry` or `alarm` data to validate this phase.
- **FR-014**: Feature MUST specify the backend-mediated API or event path used by clients; frontend direct access to Twin infrastructure is not allowed.
- **FR-015**: Feature MUST define authentication, authorization scope, and required observability signals for live ingestion, delivery, and reconnection flows.

### Key Entities *(include if feature involves data)*

- **Live Twin Change**: A Twin-originated elevator state change that may be accepted, rejected, or quarantined based on ordering, schema, and scope rules.
- **Accepted Elevator State**: The latest backend-governed elevator state that is safe to expose to dashboard clients.
- **Realtime Session**: An authorized dashboard connection that receives synchronization state and accepted live elevator changes for a building scope.
- **Synchronization Status**: Operator-visible runtime health describing whether the dashboard is connecting, live, stale, reconnecting, or degraded.
- **Resynchronization Snapshot**: A backend-provided current-state refresh used after reconnect or missed delivery to restore the latest accepted state.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: Ditto remains the single source of truth for elevator state changes. The dashboard can only act on state that the backend has normalized and accepted.
- **Realtime Model**: Live Twin changes enter the backend, pass ordering and scope checks, update materialized elevator state, and are pushed to authorized dashboard sessions. Recovery uses backend-mediated resynchronization rather than direct client access to Twin channels.
- **Failure Handling**: Operators must see stale, reconnecting, and degraded states when live delivery is interrupted. The dashboard retains last accepted state when possible and resumes from current accepted state after recovery.
- **Security Boundary**: Twin credentials remain backend-only. Operator access to bootstrap and live updates is authenticated and scoped by building and role.
- **Observability**: The system needs health signals for Twin live connectivity, accepted and rejected event counts, active dashboard sessions, last accepted live update, resynchronization attempts, and client delivery failures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the dashboard is initially ready, a valid Twin state change for an in-scope elevator appears across list, detail, summary, and 3D views within 500 ms during local validation.
- **SC-002**: During duplicate, out-of-order, malformed, and out-of-scope replay validation, zero rejected live changes cause visible dashboard state regressions or duplicate transitions.
- **SC-003**: When live delivery is interrupted, stale or degraded synchronization feedback becomes visible within 2 seconds while the last accepted elevator state remains visible.
- **SC-004**: After connectivity recovery, the dashboard restores current accepted state without requiring a full page reload in at least 95% of local validation runs.
- **SC-005**: A documented local validation flow allows a developer to prove accepted live propagation, rejected-event handling, interruption, and recovery in under 15 minutes from a clean startup.

## Assumptions

- The active validation building remains `L72` unless another authorized building scope is explicitly configured.
- Initial REST bootstrap remains the first load path; this feature extends the live synchronization layer after bootstrap.
- Existing dashboard elevator contracts and 3D projection semantics remain the baseline presentation model.
- Local validation may use a developer-friendly authentication path as long as production-style backend mediation and scope boundaries are preserved.
- AI prediction, historical analytics, and non-elevator Twin entities remain out of scope for this feature.
