# Contract: Realtime Risk Warning Event

## Purpose

Define the backend-to-frontend realtime event emitted when a predictive-maintenance warning is accepted.

## Event Envelope

The event uses the existing backend realtime envelope.

```json
{
  "eventId": "evt-risk-org.example:L72-ELEV-A-door.blocked.v1",
  "eventType": "elevator.risk.updated",
  "schemaVersion": "1.0.0",
  "dataClass": "alarm",
  "occurredAt": "2026-05-06T10:00:00.000Z",
  "payload": {}
}
```

## Payload

Required fields:

- `riskWarningId`
- `elevatorId`
- `riskLevel`
- `predictedWindowHours`
- `generatedAt`
- `drivers`
- `modelVersion`
- `validationRunId`
- `verificationStatus`
- `modelTrace`
- `status`

Recommended driver shape:

```json
{
  "driverId": "door.blocked",
  "label": "Door blockage detected",
  "signal": "doorState",
  "observedValue": "blocked",
  "threshold": "blocked",
  "severityContribution": "critical"
}
```

The existing frontend may initially render string drivers; structured drivers should remain backward-compatible by also exposing a concise label.

## Delivery Rules

- Emit only after warning ingestion succeeds.
- Do not emit duplicate equivalent warnings within the active warning window.
- Building authorization remains enforced by the backend session and channel scope.
- If no frontend sessions are connected, the warning remains available through analytics REST.

## REST Read Path

Existing analytics read path remains:

```text
GET /analytics/risk
GET /analytics/risk/readiness
```

Responses must include generated rule warnings with the same trace fields used by realtime events.
