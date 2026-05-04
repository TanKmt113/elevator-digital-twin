# Realtime Event Contract

## Transport

- Backend-managed WebSocket endpoint: `/ws`
- Authentication: bearer token during session establishment
- Delivery model: server-to-client event stream with optional client command
  acknowledgement correlation

## Envelope

All events share this envelope:

```json
{
  "eventId": "evt_123",
  "eventType": "elevator.state.changed",
  "schemaVersion": "1.0.0",
  "dataClass": "realtime",
  "occurredAt": "2026-05-04T12:00:00Z",
  "correlationId": "cmd_456",
  "payload": {}
}
```

## Event Types

### `elevator.state.changed`

**Purpose**: Publish latest normalized elevator state for dashboard and 3D view.

**Payload**

```json
{
  "elevatorId": "L72-ELEV-A",
  "status": "moving",
  "currentFloor": 12,
  "targetFloor": 18,
  "direction": "up",
  "doorState": "closed",
  "loadPercentage": 61.5,
  "healthState": "normal",
  "stale": false
}
```

### `elevator.alert.raised`

**Purpose**: Publish a new alert or severity escalation.

**Payload**

```json
{
  "alertId": "alt_001",
  "elevatorId": "L72-ELEV-A",
  "alertType": "overload",
  "severity": "critical",
  "status": "open",
  "message": "Elevator overload detected"
}
```

### `elevator.alert.updated`

**Purpose**: Reflect acknowledgement or resolution changes.

**Payload**

```json
{
  "alertId": "alt_001",
  "status": "acknowledged",
  "acknowledgedAt": "2026-05-04T12:00:08Z",
  "acknowledgedByUserId": "user_42"
}
```

### `elevator.command.status`

**Purpose**: Publish lifecycle changes for a submitted command.

**Payload**

```json
{
  "commandId": "cmd_456",
  "elevatorId": "L72-ELEV-A",
  "status": "completed",
  "message": "Move command completed"
}
```

### `elevator.risk.updated`

**Purpose**: Publish a predictive maintenance warning or expiry.

**Payload**

```json
{
  "riskWarningId": "risk_008",
  "elevatorId": "L72-ELEV-A",
  "riskLevel": "high",
  "predictedWindowHours": 48,
  "drivers": ["temperature", "vibration"]
}
```

### `system.connection.state`

**Purpose**: Inform clients when live data is degraded or restored.

**Payload**

```json
{
  "scope": "building",
  "status": "degraded",
  "message": "Live updates delayed; showing last known elevator state"
}
```

## Client Expectations

- Clients must ignore unknown event types while preserving the session.
- Clients must apply idempotent updates using `eventId` and `correlationId`.
- Clients must mark assets stale when `system.connection.state` indicates
  degradation or when asset freshness exceeds the backend-defined threshold.
