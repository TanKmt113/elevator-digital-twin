# Realtime Event Contract: Ditto End-to-End Runtime

## Envelope

All backend-to-frontend realtime messages use a versioned envelope:

```json
{
  "eventId": "evt-2026-05-04T10:00:00.000Z-L72-ELEV-A",
  "eventType": "elevator.state.changed",
  "schemaVersion": "1.0.0",
  "dataClass": "realtime",
  "occurredAt": "2026-05-04T10:00:00.000Z",
  "correlationId": "optional-correlation-id",
  "payload": {}
}
```

## Event Types

### `system.connection.state`

Communicates backend-observed synchronization health.

Required payload fields:

- `buildingId`
- `bootstrapStatus`
- `connectionState`: `connecting`, `live`, `stale`, `degraded`, or `resyncing`
- `dataState`: `loading`, `ready`, `empty`, or `degraded`
- `dittoHttpState`
- `dittoLiveState`
- `frontendRealtimeState`
- `activeSessions`
- event rejection counters

Rules:

- Clients must update dashboard banners and 3D stale/degraded presentation from this event.
- Clients must not clear last accepted elevator state solely because this event is degraded.

### `elevator.state.changed`

Communicates one accepted normalized elevator state.

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

- Clients apply this event idempotently by `eventId` and `elevatorId`.
- Events outside the active building scope must not be delivered to that frontend session.
- 3D projection must derive from this normalized payload, never raw Ditto payloads.

### `dashboard.resync.required`

Tells a frontend client to reload current state from the backend after reconnect or suspected missed events.

Required payload fields:

- `buildingId`
- `reason`
- `requestedAt`

Rules:

- Client should fetch the current elevator list for the building and then return to live processing.
- Client should show `resyncing` while the fetch is in progress.

## Rejection Semantics

Rejected Ditto events are not published as `elevator.state.changed`. Rejection counters are surfaced through `system.connection.state` and health:

- duplicate events dropped
- out-of-order events rejected
- out-of-scope events rejected
- malformed events rejected
