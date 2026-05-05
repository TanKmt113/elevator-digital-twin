# 3D Scene State Contract

## Purpose

Define the governed scene-level state that the frontend 3D runtime consumes from normalized dashboard state.

## Scene Runtime States

- `loading`: Bootstrap or scene projection is still initializing.
- `ready`: Valid scene projections exist and the current synchronization state is usable.
- `empty`: No valid elevators are available for the active building scope.
- `stale`: The scene is showing the last accepted state while live synchronization is delayed or disconnected.
- `degraded`: Scene state is incomplete, failed, or known to be unreliable.

## Projection Requirements

Each scene projection must carry:

- `elevatorId`
- `buildingId`
- `shaftIndex`
- `floorPosition`
- `x`
- `y`
- `z`
- `movementDirection`
- `doorVisualState`
- `healthTone`
- `color`
- `isSelected`
- `highlighted`
- `isStale`
- `visualStatus`
- `label`

## Mapping Rules

- Projection state comes only from normalized elevator state already accepted by the dashboard.
- Missing or invalid source values map to governed `unknown` or degraded equivalents.
- Scene readiness must not be marked `ready` when there are zero valid projections in scope.
- Stale and degraded scene states must preserve the last accepted projection when available.
- `maintenance`, `fault`, `offline`, and `stale` visuals must remain distinguishable without requiring raw Ditto payload access in the frontend.
- Projection count and render-density sampling are part of the governed scene runtime and may be surfaced in operator overlays.

## Scene-Level Failure Semantics

- Bootstrap failure may lead to `degraded` or `empty` depending on whether any accepted state is still available.
- Live disconnect without data loss moves the scene into `stale`.
- Projection errors affecting only some elevators must not erase unaffected valid projections.
