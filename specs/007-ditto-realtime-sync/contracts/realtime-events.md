# Realtime Event Contract: Ditto Realtime Synchronization

## Envelope

All backend-to-frontend realtime messages use a governed envelope:

```json
{
  "eventId": "evt-2026-05-05T11:00:00.000Z-L72-ELEV-A",
  "eventType": "elevator.state.changed",
  "schemaVersion": "1.0.0",
  "dataClass": "realtime",
  "occurredAt": "2026-05-05T11:00:00.000Z",
  "correlationId": "optional-correlation-id",
  "payload": {}
}
```

## Event Types

### `elevator.state.changed`

Published when the backend accepts a live Twin change for an in-scope elevator.

Required payload fields:

- `elevatorId`
- `buildingId`
- `schemaVersion`
- `deviceType`
- `status`
- `currentFloor`
- `direction`
- `doorState`
- `healthState`
- `lastEventAt`
- `stale`

Rules:

- The payload is the normalized accepted elevator state, never raw Ditto structure.
- Clients apply this event idempotently by `eventId` and `elevatorId`.
- Sessions outside the elevator's building scope must not receive the event.

### `system.connection.state`

Published when synchronization health changes or rejection counters need to be surfaced.

Required payload fields:

- `buildingId`
- `bootstrapStatus`
- `connectionState`
- `dataState`
- `lastBootstrapAt`
- `lastLiveEventAt`
- `duplicateEventsDropped`
- `outOfOrderEventsRejected`
- `outOfScopeEventsRejected`
- `malformedEventsRejected`
- `lastFailureReason`

Rules:

- Clients update operator-visible banners, stale indicators, and resync state from this event.
- Clients do not clear last accepted elevator state solely because this event indicates `stale`, `resyncing`, or `degraded`.

### `dashboard.resync.required`

Published when a client must refresh current accepted state from backend bootstrap before resuming normal live behavior.

Required payload fields:

- `buildingId`
- `reason`
- `requestedAt`

Rules:

- The client should move to `resyncing`, fetch the current accepted snapshot, apply it, and then return to live processing when successful.
- Repeated resync requests for the same interruption should be coalesced by the client.

## Rejection Semantics

The following live Twin changes are rejected before state mutation and before browser publication:

- duplicate event identifiers
- out-of-order changes older than the last accepted state for the same elevator
- malformed changes that cannot be normalized into the governed contract
- out-of-scope changes for another building or missing required scope identity

Rejected changes are exposed only through synchronization health, counters, and logs.
