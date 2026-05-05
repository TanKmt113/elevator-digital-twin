# Data Model: True 3D Elevator Rendering

## 3D Cabin Projection

**Purpose**: Represents one elevator cabin as rendered in true 3D space.

**Fields**

- `elevatorId`: string, required, unique within the active building scope
- `buildingId`: string, required for scoped validation
- `shaftIndex`: integer, required, zero-based spatial column index
- `floorPosition`: integer, required, accepted operational floor
- `targetFloor`: integer, optional
- `worldPosition`: object, required
- `worldPosition.x`: number
- `worldPosition.y`: number
- `worldPosition.z`: number
- `movementDirection`: enum `up | down | stationary | unknown`
- `doorVisualState`: enum `open | closed | transitioning | unknown`
- `visualStatus`: enum `idle | moving | maintenance | fault | offline | stale | degraded | unknown`
- `healthTone`: enum `normal | warning | critical | unknown`
- `isSelected`: boolean
- `isHighlighted`: boolean
- `isStale`: boolean
- `label`: string, operator-facing display text

**Validation Rules**

- `worldPosition.y` must be derived from `floorPosition` using a deterministic floor-height mapping.
- Invalid or missing floor or direction values must map to a governed `unknown` or degraded equivalent rather than produce undefined geometry.
- Projection state can only be built from normalized dashboard state, never directly from raw Twin payloads.

## 3D Building Scene

**Purpose**: Represents the spatial runtime view for the active building.

**Fields**

- `buildingId`: string
- `runtimeState`: enum `loading | ready | empty | stale | degraded | unavailable`
- `projectionCount`: integer
- `floorCount`: integer
- `shaftCount`: integer
- `hasWebglSupport`: boolean
- `renderDensity`: enum `light | moderate | dense`
- `lastRenderSampleMs`: number, optional
- `selectedElevatorId`: string, optional
- `focusMode`: enum `overview | selected`

**Validation Rules**

- `runtimeState` cannot be `ready` if `projectionCount` is zero.
- `runtimeState` must become `unavailable` when WebGL support is absent or initialization fails.
- `shaftCount` and `floorCount` must be sufficient to place every active projection in bounds.

## Camera Focus Context

**Purpose**: Governs how the operator views the 3D building scene.

**Fields**

- `focusMode`: enum `overview | selected`
- `selectedElevatorId`: string, optional
- `anchorPosition`: object, optional
- `anchorPosition.x`: number
- `anchorPosition.y`: number
- `anchorPosition.z`: number
- `transitionState`: enum `idle | transitioning`
- `lastFocusChangeAt`: ISO-8601 timestamp, optional

**State Transitions**

- `overview -> selected`: triggered when an elevator is selected from list or scene and selected focus is activated.
- `selected -> overview`: triggered when the operator resets to overview mode.
- `selected -> selected`: triggered when another elevator becomes the active inspection target.
- `selected -> overview`: fallback transition when the selected elevator disappears from scope.

## Scene Runtime Signal

**Purpose**: Captures operator-visible and testable readiness or failure conditions for the true 3D renderer.

**Fields**

- `sceneRuntime`: enum `loading | ready | empty | stale | degraded | unavailable`
- `staleMessage`: string, optional
- `webglMessage`: string, optional
- `projectionFailures`: integer
- `frameBudgetExceeded`: boolean

**Validation Rules**

- `sceneRuntime` must remain aligned with the shared dashboard synchronization model.
- `projectionFailures` may degrade the scene but must not erase valid unaffected cabins.
- `webglMessage` is required when runtime is `unavailable` due to browser capability or initialization failure.
