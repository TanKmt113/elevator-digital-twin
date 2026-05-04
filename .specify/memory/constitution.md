<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Digital Twin as the Operational Backbone
- Template Principle 2 -> II. Event-Driven and Reality-Tolerant Systems
- Template Principle 3 -> III. Layered Architecture with Backend Control Plane
- Template Principle 4 -> IV. Governed Data, Schemas, and State
- Template Principle 5 -> V. Operational Excellence as a Release Gate
Added sections:
- System Constraints & Standards
- Delivery Workflow & Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ⚠ pending .specify/templates/commands/*.md (directory not present in repository)
- ⚠ pending runtime guidance docs beyond AGENTS.md (no additional docs present in repository)
Follow-up TODOs:
- None
-->
# Smart Building Digital Twin Platform Constitution

## Core Principles

### I. Digital Twin as the Operational Backbone
The Digital Twin platform MUST be the single source of truth for operational
state across elevator, HVAC, energy, water, security, and future building
domains. All user interfaces, backend APIs, analytics pipelines, and AI
services MUST read canonical state from the Twin or from storage derived from
Twin events. No feature MAY bypass the Twin to read or mutate operational data
directly from devices except through explicitly governed ingestion paths.
Rationale: a single operational model prevents conflicting state, fragmented
logic, and unsafe automation decisions.

### II. Event-Driven and Reality-Tolerant Systems
Realtime behavior MUST be implemented as event streaming over push channels such
as MQTT and WebSocket, with asynchronous processing between system boundaries.
Continuous polling, synchronous blocking integrations, and designs that assume
always-online devices are prohibited unless a documented exception is approved
in the implementation plan. Every production flow MUST define behavior for
device offline conditions, delayed delivery, inconsistent telemetry, duplicate
events, and partial downstream failure. Reconnection MUST use bounded retries,
exponential backoff, and session resumption where supported.
Rationale: building operations occur in unreliable physical environments and
must continue safely under imperfect conditions.

### III. Layered Architecture with Backend Control Plane
The platform MUST preserve the layered architecture of devices and sensors,
gateway and broker, Digital Twin, backend services, frontend applications, and
AI or analytics consumers. Frontend clients MUST NOT connect directly to the
Digital Twin platform; all access MUST flow through authenticated backend APIs
or backend-managed realtime channels. Backend services MUST normalize external
events, enforce authorization, and isolate downstream concerns so the system
remains modular and ready for service extraction when scale requires it.
Rationale: the backend is the control plane for policy enforcement, schema
stability, and operational safety.

### IV. Governed Data, Schemas, and State
Each device class MUST publish and consume an explicit versioned schema that
includes device type and schema version. Platform design MUST distinguish at
least realtime, telemetry, config, and alarm data classes, and each feature
MUST state which classes it reads or writes. Events are immutable records and
MUST remain append-only; materialized state is mutable and MUST represent the
latest accepted view after normalization. Frontend business state MUST live in
an application store and UI components MUST act as projections of that state
rather than independent business logic containers.
Rationale: explicit data governance enables safe evolution, replay, analytics,
and predictable UI behavior.

### V. Operational Excellence as a Release Gate
Security, observability, testing, and deployment readiness are mandatory
release gates, not polish work. Every feature MUST define authentication and
authorization boundaries, structured logging, service metrics, trace points for
critical flows, and tests at the relevant layers, including realtime flows when
applicable. Systems MUST degrade gracefully, use controlled retries, and apply
circuit breakers or equivalent protections around failing dependencies.
Container-first delivery, automated CI validation, and environment separation
between development, staging, and production are required defaults.
Rationale: the platform supports 24/7 building operations, so resilience and
operability are part of feature completeness.

## System Constraints & Standards

### Architecture Standards
- The mandated stack flow is `Devices/Sensors -> IoT Gateway or MQTT Broker -> Digital Twin Platform -> Backend Services -> Frontend -> AI/Analytics`.
- Backend and frontend designs MUST remain modular so building domains such as `elevator`, `hvac`, `energy`, and `security` can evolve independently.
- Services MUST remain stateless unless statefulness is explicitly required and documented in the implementation plan.

### Realtime Standards
- Frontend realtime updates MUST follow `WebSocket -> state store -> UI render`.
- Incoming Twin events MUST be parsed, transformed, and normalized before they reach application state or downstream consumers.
- Features that introduce large realtime collections MUST define virtualization or equivalent rendering controls and MUST avoid global rerender patterns.

### Security Standards
- Zero Trust applies to every boundary; no internal network path is trusted by default.
- User-facing authentication MUST use JWT or an equivalent token strategy approved in the plan, and service-to-service authentication MUST be defined separately from user auth.
- Authorization MUST enforce RBAC plus resource-level policy for building, device, and role scopes.

### Reliability and Observability Standards
- Failure of one service MUST NOT cause total system outage for unaffected building functions.
- Retry policies MUST be bounded and MUST avoid retry storms.
- Production services MUST emit structured logs, latency metrics, device online/offline metrics, event throughput metrics, and error-rate metrics.
- Critical realtime and control-plane paths MUST expose tracing spans or an equivalent correlation mechanism.

### AI and Analytics Standards
- AI and analytics workloads MUST read from the Digital Twin or sanctioned data lake derivatives, never directly from devices.
- Supported AI scenarios include anomaly detection, predictive maintenance, and traffic optimization, and each use case MUST declare its source data, freshness requirements, and fallback behavior if source data degrades.

### Scalability and Compatibility Standards
- System evolution MUST preserve backward compatibility for published APIs, schemas, and event contracts unless an approved major version change is made.
- Everything that crosses a service or client boundary MUST be versioned, including schemas, APIs, and event envelopes.
- Polling as a substitute for realtime architecture is prohibited unless the exception is explicitly documented as a temporary containment measure.

## Delivery Workflow & Quality Gates

### Planning and Review
- Every specification and implementation plan MUST document how the feature preserves Twin authority, event-driven delivery, backend mediation, schema governance, resilience, and operational observability.
- Any exception to these principles MUST be recorded in the plan's complexity or risk tracking section with a time-bounded remediation path.

### Testing Requirements
- Testing is mandatory and MUST be selected by layer: device or sensor mocks, API or contract tests, UI tests, realtime flow tests, and chaos or failure simulation where the feature changes resilience behavior.
- A feature is not complete until its primary user journey and failure modes are validated at the relevant layers.

### Deployment Requirements
- Delivery MUST be container-first and automation-ready for CI/CD pipelines.
- Changes MUST identify required environment variables, secrets, migrations, rollout controls, and rollback expectations before production release.
- Development, staging, and production environments MUST remain distinct, and production-only behavior MUST not be hardcoded into the application.

### Prohibited Anti-Patterns
- Frontend direct access to the Digital Twin platform.
- Missing or unversioned device schemas.
- Polling used in place of sanctioned realtime transport.
- Complex business logic embedded in UI components.
- Shipping services without monitoring, alertable metrics, or failure handling.

## Governance
This constitution supersedes conflicting local conventions for architecture,
delivery, and operational quality within this repository. Amendments require a
documented rationale, an impact review of dependent templates, and updates to
any affected workflow guidance before merge. Compliance reviews MUST occur
during specification, planning, implementation, and code review, and every pull
request MUST explicitly confirm whether the work preserves Twin authority,
backend mediation, event-driven behavior, schema governance, and operational
gates. Versioning follows semantic rules for governance documents: MAJOR for
incompatible principle changes or removals, MINOR for new principles or
materially expanded obligations, and PATCH for clarifications that do not alter
project obligations.

**Version**: 1.0.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
