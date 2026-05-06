# Contract: Enhanced Elevator State

## Purpose

Define the backend-normalized state returned by bootstrap and detail endpoints and used as the payload for accepted realtime updates.

## Version

- `schemaVersion`: `1.1.0`

## REST Bootstrap Shape

```json
{
  "items": [
    {
      "elevatorId": "org.example:L72-ELEV-A",
      "buildingId": "L72",
      "schemaVersion": "1.1.0",
      "deviceType": "elevator",
      "status": "moving",
      "currentFloor": 4,
      "targetFloor": 8,
      "positionMeters": 12.6,
      "floorProgress": 0.42,
      "speedMps": 1.5,
      "accelerationMps2": 0.2,
      "direction": "up",
      "doorState": "closed",
      "doorOpenPercent": 0,
      "loadKg": 340,
      "ratedLoadKg": 1000,
      "loadPercentage": 34,
      "mode": "normal",
      "brakeState": "released",
      "motorState": "running",
      "controllerState": "normal",
      "healthState": "normal",
      "activeCalls": [],
      "stopQueue": [8],
      "etaSeconds": 18,
      "lastEventAt": "2026-05-06T01:18:13.576Z",
      "stale": false
    }
  ],
  "meta": {
    "synchronization": {}
  }
}
```

## Rules

- Required identity and scope fields must be present before publication.
- Optional enhanced fields may be absent but must not be silently rendered as healthy.
- Partial Ditto updates must be materialized into this full state before frontend delivery.
- Unknown enum values normalize to `unknown`.
- Physical values outside configured bounds are rejected or clamped only when the chosen behavior is explicitly documented in validation metadata.
