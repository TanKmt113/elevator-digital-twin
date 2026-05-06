# Ditto Live Event Contract

## Purpose

Define how Twin-originated live changes are projected into backend-normalized elevator events.

## Accepted Source Topics

The backend live consumer subscribes to Twin event traffic for elevator Things in the active namespace/building scope. The source event must identify:

- Thing identity
- event or revision identity when available
- event timestamp or modification timestamp
- changed elevator feature properties

## Source Payload Expectations

Source payloads are accepted when they can be projected into:

- `thingId`
- `attributes.buildingId` or an equivalent known building scope
- `features.elevator.properties.status`
- `features.elevator.properties.currentFloor`
- `features.elevator.properties.direction`
- `features.elevator.properties.doorState`
- `features.elevator.properties.healthState`
- event timestamp

## Backend Projection

Backend projection maps Ditto source payloads to `NormalizedElevatorState`:

- `thingId` -> `elevatorId`
- `attributes.buildingId` -> `buildingId`
- `features.elevator.properties.status` -> `status`
- `features.elevator.properties.currentFloor` -> `currentFloor`
- `features.elevator.properties.targetFloor` -> `targetFloor`
- `features.elevator.properties.direction` -> `direction`
- `features.elevator.properties.doorState` -> `doorState`
- `features.elevator.properties.loadPercentage` -> `loadPercentage`
- `features.elevator.properties.healthState` -> `healthState`
- event timestamp -> `lastEventAt`

## Acceptance Rules

- Missing building scope: reject as `out_of_scope` or `malformed`.
- Unknown enum: normalize to governed fallback and count as accepted with normalization.
- Duplicate event identity: reject as duplicate.
- Older event for the same elevator: reject as out of order.
- Unsupported schema or unparseable payload: reject as malformed.

## Reconnect and Resync

When the live consumer reconnects after a gap, backend synchronization enters `resyncing`, refreshes current building state from Ditto HTTP, then returns to `live` only after the materialized state is reconciled.
