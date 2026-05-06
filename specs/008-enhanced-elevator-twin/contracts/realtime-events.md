# Contract: Enhanced Realtime Events

## Envelope

```json
{
  "eventId": "evt-2026-05-06T01:18:13.576Z-L72-ELEV-A",
  "eventType": "elevator.state.changed",
  "schemaVersion": "1.1.0",
  "dataClass": "realtime",
  "occurredAt": "2026-05-06T01:18:13.576Z",
  "correlationId": "optional-correlation-id",
  "payload": {}
}
```

## Event Types

### `elevator.state.changed`

Published when an accepted enhanced Twin update changes the materialized elevator projection.

Payload: `EnhancedElevatorTwin`.

Rules:

- Payload must be complete enough for all frontend surfaces.
- Partial source events are not forwarded as partial frontend state.
- Sessions outside the building scope must not receive the event.

### `elevator.telemetry.sampled`

Published optionally for high-frequency telemetry if the value should update diagnostic panels without changing the full state envelope.

Payload fields:

- `elevatorId`
- `buildingId`
- `recordedAt`
- selected telemetry fields

### `elevator.fault.changed`

Published when a fault appears, is acknowledged, changes severity, or clears.

Payload fields:

- `faultId`
- `elevatorId`
- `buildingId`
- `faultCode`
- `faultSeverity`
- `status`
- `occurredAt`

### `dashboard.resync.required`

Published when clients must refresh accepted state from backend bootstrap.

### `system.connection.state`

Published for synchronization health, rejection counters, hydration failures, active sessions, stale state, and degraded reasons.

## Rejection Counters

The synchronization payload must expose counts for:

- duplicate events dropped
- out-of-order events rejected
- out-of-scope events rejected
- malformed events rejected
- hydration failures
- normalization failures
- command policy rejections
