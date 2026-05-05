# True 3D Scene Runtime Contract

## Purpose

Define the governed runtime behavior for the true 3D elevator scene.

## Runtime States

- `loading`: The renderer or scene projections are still initializing.
- `ready`: Valid cabin geometry exists and the current synchronization state is usable.
- `empty`: The active building scope contains no valid elevator projections.
- `stale`: The renderer is showing the last accepted 3D state while live synchronization is delayed or reconnecting.
- `degraded`: Scene data is incomplete, partially failed, or not fully trustworthy.
- `unavailable`: The browser cannot initialize the 3D runtime or required rendering support is missing.

## Runtime Inputs

The renderer may only consume:

- backend-mediated elevator bootstrap data already normalized into dashboard state
- backend-mediated realtime updates already normalized into dashboard state
- shared selection and focus state from the frontend application store
- local browser capability signals required to determine 3D availability

The renderer must not consume:

- raw Ditto websocket events directly
- browser-originated requests to Ditto HTTP or websocket endpoints
- AI-service predictions as a prerequisite for scene readiness

## Projection Rules

Each cabin projection must carry:

- `elevatorId`
- `buildingId`
- `shaftIndex`
- `floorPosition`
- `worldPosition`
- `movementDirection`
- `doorVisualState`
- `visualStatus`
- `healthTone`
- `isSelected`
- `isHighlighted`
- `isStale`

## Failure Semantics

- Missing or malformed elevator values must degrade the affected projection instead of collapsing the entire scene.
- Loss of WebGL capability or initialization failure must transition the scene to `unavailable` with an operator-visible explanation.
- Stale or degraded runtime must preserve the last accepted cabin geometry when available.
- Projection failures for one cabin must not erase valid unaffected cabins.

## Observability Signals

The runtime must expose operator-visible or testable signals for:

- scene initialization start and completion
- projection count
- render-density classification
- frame-budget exceedance
- projection failure count
- stale, degraded, and unavailable scene states
