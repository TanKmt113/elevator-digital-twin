# Phase 0 Research: Ditto End-to-End Digital Twin Runtime

## Decision: Use backend REST bootstrap plus backend websocket live delivery

**Rationale**: REST bootstrap gives clients a deterministic current state and synchronization snapshot when the dashboard loads. Websocket delivery then carries accepted changes without polling. This preserves the constitution requirement that frontend clients never connect directly to Ditto.

**Alternatives considered**:
- **Frontend calls Ditto directly**: Rejected because it leaks Twin credentials and bypasses backend authorization and normalization.
- **Frontend polling `/elevators`**: Rejected because polling is prohibited as a substitute for realtime behavior and would hide delivery-quality failures.
- **Only websocket without REST bootstrap**: Rejected because clients need current state immediately after load and after reconnect.

## Decision: Seed local data into Ditto, not directly into backend repositories

**Rationale**: The point of the phase is to validate Ditto as the operational source. Seed scripts or documented commands should create policy and elevator Things in Ditto, after which backend bootstrap uses the same path as production.

**Alternatives considered**:
- **Seed backend memory directly**: Rejected because it bypasses Twin authority and would not validate Ditto mapping.
- **Keep manual Ditto UI setup only**: Rejected because validation must be repeatable for development and demos.

## Decision: Implement real backend websocket sessions behind the existing realtime manager

**Rationale**: The current session manager is a useful publish abstraction for tests. A real websocket adapter can preserve the existing publisher API while adding browser connectivity, session counts, auth checks, and close/error handling.

**Alternatives considered**:
- **Replace the realtime module wholesale**: Rejected because current publishers and tests already depend on the manager abstraction.
- **Server-sent events**: Rejected for this phase because the project already depends on websocket transport and needs bidirectional-ready session semantics for future controls.

## Decision: Add a Ditto live consumer adapter separate from HTTP bootstrap

**Rationale**: HTTP list/get calls and live event subscription have different lifecycle, retry, parsing, and observability needs. Keeping a consumer adapter separate from `listThings()` avoids coupling startup bootstrap to long-running live transport.

**Alternatives considered**:
- **Put websocket logic inside `listThings()` client methods**: Rejected because it mixes request/response and streaming lifecycles.
- **Depend only on MQTT broker events**: Deferred. Ditto is the requested Twin source for this phase, and MQTT can remain an infrastructure dependency for later device ingestion work.

## Decision: Use bounded reconnect and explicit resync after reconnect

**Rationale**: Realtime channels can drop. After reconnect, the frontend and backend should resync from backend state before accepting the stream as live, preventing missed-event gaps from becoming invisible.

**Alternatives considered**:
- **Retry forever without state changes**: Rejected because operators need visible stale/reconnecting state and retry storms must be avoided.
- **Clear dashboard state on disconnect**: Rejected because last accepted state is still operationally useful when marked stale.

## Decision: Reuse JWT/RBAC for operator access and add a documented local token path

**Rationale**: Routes already enforce JWT and role checks. The phase should make local validation practical by documenting or adding a developer token path while keeping the production boundary intact.

**Alternatives considered**:
- **Disable auth in development globally**: Rejected because it hides scope bugs in bootstrap and realtime flows.
- **Introduce a new auth system**: Rejected because it is outside the phase goal and the current middleware is sufficient for scoped validation.

## Decision: Keep AI service excluded from validation

**Rationale**: The feature is about making Digital Twin runtime connectivity real. AI availability must not block bootstrap, live event delivery, 3D projection, or degraded-state validation.

**Alternatives considered**:
- **Include risk analytics in the quickstart**: Rejected because it couples this phase to predictive maintenance work already deferred.
