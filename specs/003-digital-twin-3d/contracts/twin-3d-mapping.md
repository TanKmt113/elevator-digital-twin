# Twin to 3D Mapping Contract

## Purpose

Define how normalized elevator state becomes a 3D scene projection for the operations dashboard.

## Source State

The source is the backend-normalized elevator model, not the raw Twin Thing payload.

Required source fields:

- `elevatorId`
- `buildingId`
- `status`
- `currentFloor`
- `targetFloor`
- `direction`
- `doorState`
- `loadPercentage`
- `healthState`
- synchronization freshness metadata when available

## Projection Mapping

- `elevatorId` -> `projection.elevatorId`
- `buildingId` -> `projection.buildingId`
- `currentFloor` -> `projection.floorPosition`
- `direction` -> `projection.movementDirection`
- `doorState` -> `projection.doorVisualState`
- `healthState` -> `projection.healthTone`
- selected dashboard elevator -> `projection.isSelected`
- stale or degraded synchronization state -> `projection.isStale`

## Visual State Rules

- `healthState=normal` maps to normal visual tone.
- `healthState=warning` maps to warning visual tone.
- `healthState=critical` maps to critical visual tone.
- Unknown values map to unknown visual tone rather than raw display values.
- Door states `opening` and `closing` map to transitioning visual state.
- A stale projection must remain visible but visually distinguishable from live state.

## Validation Rules

- The 3D scene must not render raw Twin payload fields directly.
- The 3D scene must not maintain a separate selected elevator identity that can diverge from dashboard state.
- Missing elevator state should render an empty or degraded 3D state, not a misleading static scene.
