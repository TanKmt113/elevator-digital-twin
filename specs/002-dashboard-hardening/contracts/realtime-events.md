# Realtime Event Contract Delta

## Purpose

This phase keeps the existing event envelope and adds stronger expectations around startup readiness, stale-state signaling, and bootstrap-to-live reconciliation.

## Required Behaviors

- Clients MUST treat the initial dashboard state as `loading` until bootstrap completion or explicit bootstrap failure is known.
- Clients MUST preserve idempotent application of accepted live events after bootstrap.
- Clients MUST expose explicit stale or degraded state when the backend signals connection degradation or when asset freshness exceeds the configured threshold.

## Event Expectations

### `system.connection.state`

This event remains the primary degraded-state signal and is now expected to cover:

- `connecting`
- `live`
- `degraded`
- `resyncing`

### `elevator.state.changed`

- Events must be reconcilable against the current normalized elevator state created during bootstrap.
- Duplicate events must not create duplicate UI transitions.
- Out-of-scope elevators must be rejected or isolated according to backend scope rules.
