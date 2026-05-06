# Contract: Scene Projection

## Purpose

Define the derived frontend projection used by the 3D scene. This projection is not authoritative elevator truth.

## Input

- `EnhancedElevatorTwin`
- `BuildingShaftLayout`
- selected elevator identity
- scene runtime state
- playback mode state

## Projection Fields

```json
{
  "elevatorId": "org.example:L72-ELEV-A",
  "buildingId": "L72",
  "shaftId": "shaft-a",
  "worldPosition": { "x": 0, "y": 12.6, "z": 0 },
  "targetWorldPosition": { "x": 0, "y": 24, "z": 0 },
  "doorOpenRatio": 0,
  "movementDirection": "up",
  "visualStatus": "moving",
  "healthTone": "normal",
  "loadTone": "normal",
  "faultTone": "none",
  "isSelected": true,
  "isStale": false,
  "isPlayback": false,
  "label": "L72-ELEV-A floor 4 -> 8",
  "cameraTarget": { "x": 0, "y": 12.6, "z": 0 }
}
```

## Rules

- Continuous position wins over floor-derived position when valid.
- Floor-derived fallback uses configured floor height.
- Door ratio derives from `doorOpenPercent` when present and from `doorState` otherwise.
- Stale, degraded, playback, maintenance, and fault states must remain visually explicit.
- Selection and camera focus use the shared elevator store identity.
