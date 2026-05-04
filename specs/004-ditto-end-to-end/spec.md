# Feature Specification: Ditto End-to-End Digital Twin Runtime

**Feature Branch**: `[004-ditto-end-to-end]`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "Write the next Spec Kit phase documentation so the Digital Twin can run end-to-end when Ditto is available, based on the current backend/frontend gaps."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bootstrap From Live Twin Data (Priority: P1)

An operator opens the dashboard and sees the current elevator state loaded from the Digital Twin without waiting for a newly arriving event.

**Why this priority**: This is the minimum usable Digital Twin runtime. Without current state bootstrap, the dashboard can look empty or stale even when Ditto is healthy.

**Independent Test**: Can be tested by starting the platform with a Ditto environment containing elevator Things, loading the dashboard, and confirming the list, detail panel, health banner, and 3D projection show the authorized building state.

**Acceptance Scenarios**:

1. **Given** Ditto contains elevator Things for the active building, **When** the backend starts and the operator loads the dashboard, **Then** the dashboard shows those elevators with ready synchronization status.
2. **Given** Ditto is reachable but contains no elevators in the active building scope, **When** the operator loads the dashboard, **Then** the dashboard shows an explicit empty Twin state instead of sample or misleading data.
3. **Given** Ditto bootstrap fails, **When** the operator loads the dashboard, **Then** the dashboard shows degraded state and preserves any last accepted elevator state when available.

---

### User Story 2 - Receive Live Twin Events End-to-End (Priority: P1)

An operator sees elevator state changes from Ditto propagate through the backend to all dashboard surfaces in order and without duplicates.

**Why this priority**: Digital Twin monitoring depends on live updates after bootstrap. The backend must remain the authority that filters and normalizes events before the frontend renders them.

**Independent Test**: Can be tested by replaying accepted, duplicate, late, malformed, and out-of-scope Twin updates and verifying only accepted changes update the list, detail panel, and 3D projection.

**Acceptance Scenarios**:

1. **Given** a dashboard already bootstrapped from Ditto, **When** an accepted elevator update arrives from the Twin, **Then** the list, detail panel, and 3D scene update to the same state.
2. **Given** a duplicate or out-of-order event arrives, **When** the backend processes it, **Then** the event is rejected and no duplicate or stale UI transition appears.
3. **Given** a Twin update belongs to another building, **When** it reaches the backend, **Then** it is rejected or isolated from the active dashboard scope.

---

### User Story 3 - Operate With Real Client Connectivity (Priority: P2)

An operator can use the frontend against a running backend with authenticated API calls, websocket updates, reconnect behavior, and visible synchronization quality.

**Why this priority**: The current dashboard needs real client-to-backend bootstrap and push transport before the Digital Twin runtime can be demonstrated outside tests.

**Independent Test**: Can be tested by opening the frontend in a browser, authenticating as an operator, loading current elevator state from the backend, disconnecting and reconnecting live transport, and confirming state and banners remain accurate.

**Acceptance Scenarios**:

1. **Given** an authenticated operator session, **When** the dashboard opens, **Then** the frontend loads the authorized elevator list and synchronization metadata from the backend.
2. **Given** the realtime connection drops, **When** reconnect attempts are in progress, **Then** the dashboard shows stale or reconnecting status while preserving last accepted elevator data.
3. **Given** authorization is missing or building scope is invalid, **When** the frontend requests elevator state, **Then** the user sees an explicit access or scope state rather than an empty operational view.

---

### User Story 4 - Run A Repeatable Local Digital Twin Demo (Priority: P2)

A developer can start local infrastructure, seed Ditto elevator data, run backend and frontend, and replay live updates using documented commands.

**Why this priority**: The feature must be reproducible for development, demos, and validation. Manual setup drift will hide integration failures.

**Independent Test**: Can be tested by following the quickstart from a clean local environment and completing bootstrap, live update, stale/degraded, and 3D selection validation without AI services.

**Acceptance Scenarios**:

1. **Given** a clean local environment, **When** the developer follows the quickstart, **Then** Ditto contains a valid building elevator dataset before backend bootstrap.
2. **Given** the local stack is running, **When** the developer replays a sample elevator movement event, **Then** the dashboard updates within the expected realtime window.
3. **Given** Ditto or realtime transport is stopped, **When** the dashboard remains open, **Then** health, logs, and UI state make the failure mode clear.

### Edge Cases

- Ditto is reachable but has no elevator Things for the selected building.
- Ditto returns Things with missing `buildingId`, unknown enum values, invalid floor values, or partial elevator features.
- Live events arrive before initial bootstrap completes.
- Live events arrive late, duplicated, out of order, malformed, or with an unsupported schema version.
- Backend-to-Ditto connectivity is healthy while backend-to-frontend realtime delivery is down, or the reverse.
- The operator token is expired, missing required role, or scoped to a different building.
- The frontend reconnects after missing events and must resynchronize without clearing last accepted state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a repeatable way to create or refresh a valid elevator Twin dataset for local validation.
- **FR-002**: System MUST load current elevator state from the Twin through the backend before relying on live events.
- **FR-003**: System MUST expose bootstrap outcomes as loading, ready, empty, partial, failed, or degraded states that clients can display.
- **FR-004**: System MUST normalize Twin elevator state into the governed dashboard elevator model before storing or publishing it.
- **FR-005**: System MUST reject or quarantine Twin records that lack required building scope.
- **FR-006**: System MUST consume live Twin updates and reconcile them against bootstrapped state.
- **FR-007**: System MUST reject duplicate, out-of-order, malformed, and out-of-scope live events without producing duplicate UI transitions.
- **FR-008**: System MUST publish accepted elevator state changes to connected dashboard clients using backend-mediated realtime delivery.
- **FR-009**: Frontend clients MUST load current building elevator state from the backend when the dashboard starts.
- **FR-010**: Frontend clients MUST apply backend synchronization metadata to loading, ready, empty, stale, reconnecting, and degraded UI states.
- **FR-011**: Frontend clients MUST connect to backend realtime delivery and update list, detail, summary, and 3D projections from accepted events.
- **FR-012**: System MUST preserve the last accepted elevator state during degraded Twin or realtime conditions when such state exists.
- **FR-013**: System MUST provide an operator-authenticated path for dashboard API and realtime access, including building scope enforcement.
- **FR-014**: Feature MUST read and write `realtime` elevator state and may read `config` data needed for building scope and elevator identity. It MUST NOT require AI telemetry or predictive scoring for validation.
- **FR-015**: Feature MUST use backend-mediated API and event paths only; frontend direct access to Twin infrastructure is not allowed.
- **FR-016**: Feature MUST define authentication, authorization scope, and required observability signals for bootstrap, live delivery, degraded state, and event rejection.

### Key Entities *(include if feature involves data)*

- **Twin Elevator Thing**: The source Twin representation of an elevator, including building identity and elevator operational properties.
- **Normalized Elevator State**: The backend-governed elevator state consumed by API, realtime, list, detail, and 3D surfaces.
- **Twin Bootstrap Run**: The attempt to load current elevator state for a building, including status, timestamps, admitted elevators, rejected records, and failure reason.
- **Live Twin Event**: A Twin-originated change that may be accepted, rejected, or quarantined based on ordering, schema, scope, and duplicate checks.
- **Realtime Client Session**: A dashboard connection that receives synchronization state and accepted elevator events.
- **Local Twin Dataset**: The seeded building/elevator dataset used by developers and validation flows.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: Elevator state must originate from Ditto or a Twin-compatible local dataset and become usable only after backend normalization and scope checks.
- **Realtime Model**: Live Twin events flow from Twin infrastructure to the backend, through event normalization and reconciliation, then to dashboard clients over backend-managed push delivery. Clients reconnect and resynchronize through backend state, not direct Twin access.
- **Failure Handling**: Empty, partial, failed, stale, reconnecting, and degraded states must be visible to operators. Last accepted state remains visible when available and clearly marked when stale or degraded.
- **Security Boundary**: Operators access elevator state through authenticated backend APIs and realtime sessions scoped by building and role. Service-to-Twin credentials remain backend-only.
- **Observability**: The system needs logs, metrics, and health fields for Twin bootstrap start/success/failure, Ditto connectivity, realtime connection state, accepted events, duplicate drops, out-of-order rejects, out-of-scope rejects, malformed payloads, active sessions, and last successful sync timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In local validation with seeded Twin data, the dashboard displays current building elevator state within 5 seconds of backend startup and page load.
- **SC-002**: Accepted live Twin updates appear consistently in list, detail, summary, and 3D surfaces within 500 ms during local steady-state validation.
- **SC-003**: Duplicate, late, malformed, and out-of-scope events produce zero duplicate or regressive UI state transitions during replay validation.
- **SC-004**: Realtime disconnect and reconnect flows preserve last accepted state and show stale or reconnecting status within 2 seconds of connection loss.
- **SC-005**: A clean local quickstart completes bootstrap, live update replay, degraded-state validation, and 3D selection validation without starting the AI service.
- **SC-006**: Health and logs identify whether a failure is caused by Twin bootstrap, Twin live consumption, backend realtime delivery, authorization, or frontend connectivity.

## Assumptions

- Ditto or a Twin-compatible local runtime is available during this phase.
- The active validation building remains `L72` unless another building scope is explicitly configured.
- Existing backend authentication and role concepts will be reused, with a developer-friendly path allowed for local validation.
- AI predictive maintenance remains out of scope for the end-to-end Digital Twin runtime.
- Existing normalized elevator, selection, and 3D projection concepts from `specs/003-digital-twin-3d/` remain the baseline.
