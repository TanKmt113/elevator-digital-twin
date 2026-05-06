# Realtime Event Contract: Digital Twin and 3D Operations View

## Purpose

This contract defines the realtime expectations for backend-normalized Twin state consumed by dashboard panels and the 3D scene.

## Required Behaviors

- Clients MUST treat the initial dashboard state as `loading` until bootstrap completion, empty scope, partial state, or explicit bootstrap failure is known.
- Clients MUST apply accepted live events idempotently after bootstrap.
- Clients MUST expose explicit stale or degraded state when backend synchronization is stale, degraded, or resynchronizing.
- Clients MUST derive 3D projection from normalized elevator state, not raw Twin payloads.

## Event Expectations

### `system.connection.state`

This event communicates synchronization status:

- `connecting`
- `live`
- `stale`
- `degraded`
- `resyncing`

Payload should identify the building scope, last bootstrap timestamp when available, last live event timestamp when available, and a failure reason for degraded states.
It may also include duplicate and out-of-order counters so clients can surface synchronization quality without deriving it locally.

### `elevator.state.changed`

- Events must be reconcilable against the current normalized elevator state created during bootstrap.
- Duplicate events must not create duplicate UI transitions.
- Out-of-order events must not overwrite newer accepted state.
- Out-of-scope elevators must be rejected or isolated according to backend scope rules.
- Payloads must include enough normalized state for list, detail, and 3D projection consumers.
- Payloads must include `buildingId` when scoped event rejection or selection validation is required.

### `dashboard.selection.changed`

- Selection events must reference one building-scoped elevator.
- Selection from list and 3D scene must converge on the same selected elevator context.
- Clearing selection must not clear accepted elevator state.
