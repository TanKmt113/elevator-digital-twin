# Data Model: 3D Operations Runtime

## Overview

This model defines the scene-level entities and interaction state needed to turn the existing Twin view into a reliable operator-facing 3D runtime while staying aligned with the normalized elevator state already used elsewhere in the dashboard.

## Entities

### SceneElevatorProjection

**Purpose**: Represents one elevator as rendered in the 3D scene.

**Fields**
- `elevatorId` (string, required)
- `buildingId` (string, required)
- `floorPosition` (integer, required)
- `verticalOffset` (number, required)
- `movementDirection` (enum, required): `up`, `down`, `stationary`, `unknown`
- `doorVisualState` (enum, required): `open`, `closed`, `transitioning`, `unknown`
- `healthTone` (enum, required): `normal`, `warning`, `critical`, `unknown`
- `isSelected` (boolean, required)
- `isHighlighted` (boolean, required)
- `isStale` (boolean, required)
- `visualStatus` (enum, required): `normal`, `maintenance`, `fault`, `offline`, `degraded`

**Validation**
- Projection must be derived only from a normalized elevator state record.
- `buildingId` must match the active scene scope.
- Unknown or malformed source fields must map to governed fallback values rather than breaking projection.

### SceneFocusContext

**Purpose**: Represents the operator's current inspection target and focus mode.

**Fields**
- `selectedElevatorId` (string, optional)
- `focusMode` (enum, required): `overview`, `selected`
- `selectionSource` (enum, optional): `list`, `detail`, `3d`, `system`
- `selectedAt` (timestamp, optional)
- `cameraPreset` (enum, required): `overview`, `shaft_focus`, `selected_follow`

**Validation**
- `selectedElevatorId` must refer to an elevator visible in the current scope or be cleared.
- `selectionSource` must reflect the last user or system action that changed focus.
- Camera preset changes must not implicitly change authorized scope.

### SceneRuntimeState

**Purpose**: Represents overall readiness and synchronization state of the 3D surface.

**Fields**
- `sceneState` (enum, required): `loading`, `ready`, `empty`, `stale`, `degraded`
- `bootstrapStatus` (enum, required): `idle`, `loading`, `completed`, `partial`, `empty`, `failed`
- `connectionState` (enum, required): `connecting`, `live`, `stale`, `degraded`, `resyncing`
- `lastSceneUpdateAt` (timestamp, optional)
- `lastSelectionSyncAt` (timestamp, optional)
- `lastFailureReason` (string, optional)

**Validation**
- `ready` requires at least one valid scene projection in scope.
- `empty` requires zero valid scene projections without transport failure.
- `degraded` or `stale` must surface an operator-readable explanation when available.

### SceneOverlayState

**Purpose**: Controls the operator-facing labels and contextual information around selected or highlighted elevators.

**Fields**
- `overlayElevatorId` (string, optional)
- `showHealth` (boolean, required)
- `showDoorState` (boolean, required)
- `showFloor` (boolean, required)
- `showSynchronizationWarning` (boolean, required)
- `layoutDensity` (enum, required): `compact`, `standard`

**Validation**
- Overlay content must not refer to an elevator outside the active scene scope.
- Warning indicators must mirror scene runtime state when the scene is stale or degraded.

### ScenePerformanceSample

**Purpose**: Captures lightweight rendering performance observations for local validation.

**Fields**
- `measuredAt` (timestamp, required)
- `renderTimeMs` (number, required)
- `frameBudgetExceeded` (boolean, required)
- `projectionCount` (integer, required)
- `activeSelection` (boolean, required)

**Validation**
- `frameBudgetExceeded` must be derived from the agreed frame budget threshold.
- Samples are observational and must not become a second source of scene state.
