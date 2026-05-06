# Ditto Seed Dataset Contract

## Purpose

Define the minimum local dataset required to validate the Digital Twin runtime against Ditto without bypassing Twin authority.

## Dataset

```json
{
  "datasetId": "local-l72-elevators",
  "buildingId": "L72",
  "policyId": "org.example:l72-elevator-policy",
  "elevators": []
}
```

## Elevator Thing Shape

Each seeded elevator must create or replace a Ditto Thing with this shape:

```json
{
  "thingId": "org.example:L72-ELEV-A",
  "policyId": "org.example:l72-elevator-policy",
  "attributes": {
    "buildingId": "L72",
    "deviceType": "elevator",
    "shaftId": "shaft-a"
  },
  "features": {
    "elevator": {
      "properties": {
        "status": "idle",
        "currentFloor": 1,
        "targetFloor": 1,
        "direction": "stationary",
        "doorState": "closed",
        "loadPercentage": 22,
        "healthState": "normal",
        "lastUpdatedAt": "2026-05-04T10:00:00.000Z"
      }
    }
  }
}
```

## Required Local Dataset

The local validation dataset should include at least:

- one idle normal elevator
- one moving normal elevator
- one maintenance or warning elevator
- one stale/degraded fixture for failure-mode validation
- one malformed fixture used only by negative tests

## Validation Rules

- Every operational seed must include `attributes.buildingId`.
- Operational seeds must use `features.elevator.properties`.
- Reapplying the dataset must update existing Things rather than create duplicate logical elevators.
- Seed commands must not write directly to backend repositories.
