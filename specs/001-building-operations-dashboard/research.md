# Phase 0 Research: Smart Building Operations Dashboard

## Decision: Use Node.js with TypeScript for the API gateway and realtime layer

**Rationale**: The feature requires a high-volume event normalization layer,
backend-managed WebSocket fan-out, OpenAPI-first REST endpoints, and close
coordination with a React frontend. A TypeScript backend keeps contract types,
realtime event mapping, and developer velocity aligned across the platform while
still allowing a separate Python service for predictive analytics.

**Alternatives considered**:
- **.NET Core**: Strong option for enterprise APIs, but it adds a second primary
  runtime without enough platform benefit for the first delivery phase.
- **Pure Python backend**: Better for analytics, weaker as the primary gateway
  for frontend contract sharing and high-churn realtime event orchestration.

## Decision: Keep Eclipse Ditto as the operational source of truth and add a backend normalization layer

**Rationale**: The constitution requires Twin-first authority and forbids
frontend direct access to Ditto. The backend will subscribe to Ditto change
events, convert raw payloads into versioned application contracts, classify data
into `realtime`, `telemetry`, `config`, and `alarm`, and expose stable REST and
WebSocket shapes to clients and downstream services.

**Alternatives considered**:
- **Frontend subscription directly to Ditto**: Rejected by constitution and
  would weaken auth, schema control, and failure handling.
- **Backend pass-through without normalization**: Faster initially, but would
  leak infrastructure-specific payloads into clients and make schema evolution
  brittle.

## Decision: Use TimescaleDB for historical telemetry and alert history

**Rationale**: Historical elevator state, alert timelines, and predictive
features need time-window queries, aggregations, and retention controls. A
PostgreSQL-compatible time-series store supports these needs while preserving
familiar SQL access patterns for reporting and analytics.

**Alternatives considered**:
- **InfluxDB**: Strong time-series option, but adopting a separate query model
  increases operational surface area for the first release.
- **MongoDB only**: Simpler infrastructure, but weaker for high-volume
  time-series analytics and windowed aggregations.

## Decision: Use MongoDB for operational metadata and 3D mapping configuration

**Rationale**: 3D model bindings, dashboard preferences, elevator metadata, and
UI-oriented configuration are document-shaped and change more flexibly than
telemetry history. Keeping them outside the time-series store avoids forcing
heterogeneous workloads into one schema style.

**Alternatives considered**:
- **Relational metadata in Timescale/PostgreSQL only**: Possible, but less
  flexible for evolving nested mapping and panel configuration documents.
- **Store metadata in Ditto only**: Would mix UI and operational concerns into
  the Twin and weaken separation of responsibility.

## Decision: Defer Kafka to phase 2 and start with MQTT -> Ditto -> backend event flow

**Rationale**: The current scope can meet its latency and scale goals through
Ditto event subscriptions and backend fan-out without introducing an additional
streaming backbone immediately. Kafka remains a planned scale-out option for
analytics replication, replay, and cross-service event distribution after the
operational core is stable.

**Alternatives considered**:
- **Kafka in phase 1**: Strong long-term backbone, but increases operational
  overhead before there is evidence that Ditto-backed flows are insufficient.
- **No event bus roadmap**: Too limiting for future cross-domain growth.

## Decision: Model command execution as acknowledged supervisory actions, not direct control completion

**Rationale**: The product must not replace or bypass elevator controllers. The
backend should accept an authorized command request, validate it, emit a command
intent into the approved control path, and report `accepted`, `rejected`,
`completed`, or `failed` as separate states based on downstream outcomes.

**Alternatives considered**:
- **Synchronous command completion response**: Misleading in a distributed
  system with device and network latency.
- **Optimistic success without downstream confirmation**: Too risky for audit
  integrity and operator trust.

## Decision: Use backend-owned WebSocket sessions with reconnect and stale-state indicators

**Rationale**: The constitution requires push-based UI updates and graceful
degradation. The backend will manage topic subscriptions, resume eligible
sessions, and mark stale assets explicitly when live feeds degrade so operators
can distinguish missing updates from stable equipment.

**Alternatives considered**:
- **Browser polling fallback**: Rejected by constitution except as a documented
  temporary exception, which is unnecessary here.
- **Server-sent events only**: Simpler for one-way streams, but weaker for
  command acknowledgement correlation and richer session semantics.

## Decision: Keep AI prediction in a separate FastAPI service reading sanctioned historical and Twin-derived data

**Rationale**: Predictive maintenance has different dependencies, testing
patterns, and scaling needs than the operational gateway. A separate service can
consume curated telemetry and usage features, publish risk results back through
approved backend-facing interfaces, and evolve independently without affecting
the control plane.

**Alternatives considered**:
- **AI inside the gateway**: Faster to prototype, but couples model runtime,
  resource usage, and release cadence to operator-facing services.
- **AI reading devices directly**: Rejected by constitution.
