# Feature Specification: Realtime Risk Engine

**Feature Branch**: `[010-risk-engine]`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Risk Engine rule-based cho predictive maintenance: backend tự đánh giá sensor realtime từ Ditto/elevator state, sinh cảnh báo rủi ro cho /analytics, publish realtime, có trace/driver/verification và không dùng ai-service ở giai đoạn này"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Detect realtime maintenance risk (Priority: P1)

As an operator monitoring the elevator fleet, I want the system to automatically detect maintenance risk from live elevator sensor signals so that I can see actionable warnings without manually interpreting raw telemetry.

**Why this priority**: This is the core user value: sensor changes should produce meaningful predictive warnings in the existing analytics view.

**Independent Test**: Feed a sequence of live elevator states with high motor temperature, high vibration, blocked doors, or repeated overload conditions and verify that the system creates the expected active risk warnings for the affected elevator.

**Acceptance Scenarios**:

1. **Given** a live elevator state with critical door blockage indicators, **When** the state is accepted by the backend, **Then** the system creates a high or critical risk warning for that elevator.
2. **Given** live elevator states showing elevated motor temperature and vibration, **When** the signals cross the configured risk thresholds, **Then** the system creates a maintenance risk warning with drivers that explain the detected condition.
3. **Given** a live elevator state within normal operating ranges, **When** the state is accepted by the backend, **Then** the system does not create a new active risk warning.

---

### User Story 2 - Explain why a warning exists (Priority: P2)

As an operator or building admin, I want every predictive warning to show the key contributing drivers so that I can understand whether the risk relates to door blockage, motor temperature, vibration, overload, or existing fault conditions.

**Why this priority**: Warnings without explanation are hard to trust or triage. Driver traceability makes the prediction useful before introducing AI service scoring.

**Independent Test**: Trigger each supported risk condition independently and verify that the resulting warning includes clear driver labels, severity, prediction window, and trace metadata.

**Acceptance Scenarios**:

1. **Given** a warning generated from blocked-door indicators, **When** the operator views the analytics panel, **Then** the warning identifies door blockage as a driver.
2. **Given** a warning generated from thermal and vibration indicators, **When** the operator views the analytics panel, **Then** the warning identifies temperature and vibration drivers.

---

### User Story 3 - Avoid noisy duplicate warnings (Priority: P3)

As an operator, I want the system to avoid flooding the analytics panel with repeated warnings for the same unresolved risk so that I can focus on current actionable issues.

**Why this priority**: Realtime sensor streams can be frequent; risk output must stay readable and operationally useful.

**Independent Test**: Feed repeated live states for the same elevator and same risk condition and verify that the system updates or suppresses duplicates according to the warning identity rules.

**Acceptance Scenarios**:

1. **Given** an active warning already exists for an elevator and risk type, **When** equivalent live states arrive repeatedly, **Then** the system does not create duplicate active warnings.
2. **Given** a risk condition worsens from warning to critical, **When** the new state is accepted, **Then** the system updates the active warning severity or creates a clearly related higher-severity warning.

### Edge Cases

- If telemetry fields required for a rule are missing, that rule is skipped and the warning trace records incomplete input coverage.
- If a device or Ditto live channel is stale, the system must not generate new risk warnings from stale state alone.
- If events arrive late, duplicated, out of order, or out of scope, risk evaluation only runs for backend-accepted normalized elevator state.
- If a warning cannot be persisted or published, elevator monitoring must continue and analytics readiness must report degraded status.
- If multiple risk rules match the same elevator state, the system must preserve the highest severity while retaining all contributing drivers.
- If a risk condition returns to normal, the system must stop generating new warnings; warning lifecycle resolution may be handled by a later maintenance workflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST evaluate every backend-accepted realtime elevator state for maintenance risk using deterministic rules.
- **FR-002**: System MUST generate a risk warning when one or more configured risk rules cross their threshold.
- **FR-003**: System MUST include elevator identity, risk level, predicted risk window, generated timestamp, drivers, model or rule version, validation run identifier, and trace metadata in every generated warning.
- **FR-004**: System MUST support at least these initial driver categories: door blockage, existing fault code, motor or controller over-temperature, abnormal vibration, and repeated overload.
- **FR-005**: System MUST avoid duplicate active warnings for the same elevator and equivalent risk condition within the active warning window.
- **FR-006**: Feature reads `realtime` and `telemetry` elevator state derived from Ditto Things and writes `alarm`-class predictive risk warnings for the canonical elevator Twin entity.
- **FR-007**: Feature MUST expose warnings only through backend-mediated REST and realtime channels; frontend direct access to Ditto or sensor infrastructure is not allowed.
- **FR-008**: Feature MUST enforce the same authenticated, building-scoped access model as existing analytics and elevator monitoring views.
- **FR-009**: System MUST record analytics readiness, accepted warning count, rejected warning count, and last failure reason.
- **FR-010**: System MUST treat missing optional telemetry fields as non-matching for rules that require those fields, rather than failing the whole risk evaluation.
- **FR-011**: System MUST publish newly accepted warnings to connected clients in realtime.
- **FR-012**: System MUST retain deterministic traceability for every warning so an operator can see which rule version and input drivers produced it.
- **FR-013**: Feature MUST NOT depend on `ai-service` for v1 risk generation.

### Key Entities *(include if feature involves data)*

- **Elevator State**: The latest backend-accepted state for one elevator, including identity, building scope, movement, door, load, temperature, vibration, fault, and health fields.
- **Risk Rule**: A deterministic definition of a maintenance risk condition, including risk type, threshold, severity mapping, prediction window, and required input fields.
- **Risk Warning**: An active predictive maintenance warning for an elevator, including risk level, drivers, trace metadata, verification status, lifecycle status, and timestamps.
- **Risk Driver**: A human-readable explanation for why a warning exists, such as door blockage, high motor temperature, abnormal vibration, overload, or active fault code.

## Operational Alignment *(mandatory for building-platform features)*

- **Twin Authority**: Risk evaluation uses backend-normalized state derived from the elevator Digital Twin. Browser clients never evaluate raw Ditto Things or write Twin state.
- **Realtime Model**: Risk evaluation runs after a live elevator update has been accepted, normalized, and admitted by the backend. Generated warnings are published through the existing backend realtime channel and are also available from the analytics read path.
- **Failure Handling**: If Ditto or realtime ingestion is degraded, the engine relies only on the last accepted fresh state and does not invent predictions from missing data. If warning generation fails, analytics readiness reports degraded while elevator monitoring continues.
- **Security Boundary**: Operators, building admins, and platform admins may view warnings within their authorized building scope. Warning generation is server-side only.
- **Observability**: Required signals include warnings evaluated, generated, suppressed as duplicate, rejected, publish failures, rule version, driver set, and analytics readiness status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When fed a validation set of known risky elevator states, the system creates the expected warning for at least 95% of cases.
- **SC-002**: When fed normal operating states, the system produces no warnings for at least 95% of cases.
- **SC-003**: New warnings appear in the analytics view within 2 seconds of the backend accepting the triggering live elevator state.
- **SC-004**: Repeated equivalent risky states for the same elevator produce no more than one active warning per risk condition during the active warning window.
- **SC-005**: Every generated warning includes at least one human-readable driver and trace metadata.
- **SC-006**: If risk evaluation fails, existing elevator monitoring and 3D visualization remain usable.

## Assumptions

- v1 uses deterministic rules, not machine learning or `ai-service`.
- Existing elevator simulator and Ditto replay flow provide enough telemetry for local validation.
- Existing authentication, RBAC, building scope, analytics route, and realtime channel are reused.
- Warning lifecycle resolution beyond duplicate suppression is limited in v1; maintenance ticket workflow is a later feature.
- Persistent telemetry history is not required for v1 rules, but the design should not block adding history-based rules later.
