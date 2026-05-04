# Data Model: Digital Twin and 3D Operations View

## Overview

This phase defines the state needed to bootstrap elevator data from the Digital Twin, reconcile live updates, and project normalized state into a synchronized 3D dashboard view.

## Entities

### TwinBootstrapSnapshot

**Purpose**: Represents the current authorized set of elevator state loaded from the operational Twin.

**Fields**
- `snapshotId` (string, required)
- `buildingId` (string, required)
- `source` (enum, required): `twin`
- `requestedAt` (timestamp, required)
- `completedAt` (timestamp, optional)
- `status` (enum, required): `loading`, `completed`, `partial`, `empty`, `failed`
- `elevators` (array[ElevatorTwin], required)
- `missingElevatorIds` (array[string], optional)
- `failureReason` (string, optional)

**Validation**
- `source` is always Twin-derived for this phase.
- `completedAt` is required when `status` is `completed`, `partial`, `empty`, or `failed`.
- `missingElevatorIds` is only present when the requested scope is incomplete.

### ElevatorTwin

**Purpose**: Represents one normalized elevator state derived from a Twin record or accepted live event.

**Fields**
- `elevatorId` (string, required)
- `buildingId` (string, required)
- `status` (enum, required): `idle`, `moving`, `maintenance`, `offline`, `unknown`
- `currentFloor` (integer, required)
- `targetFloor` (integer, optional)
- `direction` (enum, required): `up`, `down`, `stationary`, `unknown`
- `doorState` (enum, required): `open`, `closed`, `opening`, `closing`, `unknown`
- `loadPercentage` (integer, optional)
- `healthState` (enum, required): `normal`, `warning`, `critical`, `unknown`
- `lastUpdatedAt` (timestamp, optional)

**Validation**
- Unknown source enum values normalize to governed fallback values.
- `buildingId` is required before state can be admitted into the dashboard scope.
- Floor values must remain within the configured building range when available.

### RealtimeSynchronizationState

**Purpose**: Tracks whether Twin-derived elevator state is live, stale, degraded, or resynchronizing.

**Fields**
- `buildingId` (string, required)
- `connectionState` (enum, required): `connecting`, `live`, `stale`, `degraded`, `resyncing`
- `lastBootstrapAt` (timestamp, optional)
- `lastLiveEventAt` (timestamp, optional)
- `staleThresholdMs` (integer, required)
- `duplicateEventsDropped` (integer, required)
- `outOfOrderEventsRejected` (integer, required)
- `lastFailureReason` (string, optional)

**Validation**
- `staleThresholdMs` must be positive.
- `lastFailureReason` is populated for non-healthy states.

### Twin3DProjection

**Purpose**: Represents the 3D visual state derived from one normalized elevator state.

**Fields**
- `elevatorId` (string, required)
- `buildingId` (string, required)
- `shaftId` (string, optional)
- `floorPosition` (number, required)
- `movementDirection` (enum, required): `up`, `down`, `stationary`, `unknown`
- `doorVisualState` (enum, required): `open`, `closed`, `transitioning`, `unknown`
- `healthTone` (enum, required): `normal`, `warning`, `critical`, `unknown`
- `isSelected` (boolean, required)
- `isStale` (boolean, required)

**Validation**
- Projection must be derived from normalized elevator state, not raw Twin payloads.
- `isSelected` must follow the shared selected elevator context.

### DashboardSelectionState

**Purpose**: Represents the single selected elevator shared by list, detail, alert, and 3D surfaces.

**Fields**
- `selectedBuildingId` (string, required)
- `selectedElevatorId` (string, optional)
- `selectionSource` (enum, optional): `list`, `detail`, `3d`, `system`
- `selectedAt` (timestamp, optional)

**Validation**
- `selectedElevatorId` must belong to the active building scope when set.
- Clearing selected state must not clear accepted elevator data.
