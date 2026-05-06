# Data Model: Enhanced Elevator Digital Twin

## EnhancedElevatorTwin

Represents the latest accepted backend-normalized state for one elevator.

### Fields

- `elevatorId`: string, required
- `buildingId`: string, required
- `schemaVersion`: string, required, starts at `1.1.0`
- `deviceType`: `elevator`, required
- `status`: `idle | moving | door_open | maintenance | fault | offline | unknown`
- `currentFloor`: number, required
- `targetFloor`: number, optional
- `positionMeters`: number, optional
- `floorProgress`: number from 0 to 1, optional
- `speedMps`: number, optional
- `accelerationMps2`: number, optional
- `direction`: `up | down | stationary | unknown`
- `doorState`: `open | closed | opening | closing | blocked | unknown`
- `doorOpenPercent`: number from 0 to 100, optional
- `doorObstruction`: boolean, optional
- `doorCycleCount`: number, optional
- `loadKg`: number, optional
- `ratedLoadKg`: number, optional
- `loadPercentage`: number from 0 to 100, optional
- `occupancyEstimate`: number, optional
- `mode`: `normal | inspection | fire_service | independent_service | maintenance | emergency | unknown`
- `serviceMode`: string, optional normalized display value
- `brakeState`: `engaged | released | unknown`
- `motorState`: `idle | running | fault | unknown`
- `controllerState`: `normal | warning | fault | unknown`
- `motorTempC`: number, optional
- `controllerTempC`: number, optional
- `powerKw`: number, optional
- `vibrationLevel`: number, optional
- `healthState`: `normal | warning | critical | unknown`
- `faultCode`: string, optional
- `faultSeverity`: `info | warning | critical`, optional
- `lastFaultAt`: ISO timestamp, optional
- `activeCalls`: array of floor/direction call records
- `stopQueue`: array of floor numbers
- `etaSeconds`: number, optional
- `lastEventAt`: ISO timestamp, required
- `fieldFreshness`: map of field name to ISO timestamp, optional
- `stale`: boolean, required

### Validation Rules

- `buildingId` is required before frontend publication.
- `positionMeters`, `speedMps`, and `accelerationMps2` must be finite when present.
- `floorProgress` must be clamped or rejected outside 0..1.
- Door and load percentages must be finite and within 0..100 when present.
- Unknown enum values normalize to `unknown` and remain accepted unless scope or identity is invalid.
- Partial updates must merge with full hydrated state or previous accepted state before publication.

## BuildingShaftLayout

Represents configured geometry for rendering and validating spatial placement.

### Fields

- `buildingId`: string, required
- `floorHeightMeters`: number, required
- `minFloor`: number, required
- `maxFloor`: number, required
- `shafts`: array of shaft definitions
- `machineRoom`: optional geometry metadata

## ShaftDefinition

- `shaftId`: string, required
- `elevatorId`: string, optional binding
- `x`: number, required
- `z`: number, required
- `widthMeters`: number, required
- `depthMeters`: number, required
- `servedFloors`: array of floor numbers

## ThreeDCabinProjection

Render-ready state derived from `EnhancedElevatorTwin` and `BuildingShaftLayout`.

### Fields

- `elevatorId`
- `shaftId`
- `worldPosition`
- `targetWorldPosition`
- `doorOpenRatio`
- `movementDirection`
- `visualStatus`
- `healthTone`
- `loadTone`
- `faultTone`
- `isSelected`
- `isStale`
- `isPlayback`
- `label`
- `cameraTarget`

## TelemetrySample

Timestamped measurement for playback and diagnostics.

### Fields

- `sampleId`
- `elevatorId`
- `buildingId`
- `recordedAt`
- `positionMeters`
- `speedMps`
- `doorOpenPercent`
- `loadKg`
- `motorTempC`
- `controllerTempC`
- `powerKw`
- `vibrationLevel`

## FaultEvent

### Fields

- `faultId`
- `elevatorId`
- `buildingId`
- `faultCode`
- `faultSeverity`
- `subsystem`
- `message`
- `occurredAt`
- `clearedAt`
- `acknowledgedAt`
- `acknowledgedBy`

## CallQueueState

### Fields

- `elevatorId`
- `buildingId`
- `activeCalls`
- `stopQueue`
- `etaSeconds`
- `updatedAt`

## PlaybackSnapshot

Historical frame used by playback mode.

### Fields

- `snapshotId`
- `elevatorId`
- `buildingId`
- `capturedAt`
- `twin`
- `source`: `history | replay | bootstrap`
- `partial`: boolean
- `missingFields`: array of strings

## OperatorCommandRequest

### Fields

- `commandId`
- `elevatorId`
- `buildingId`
- `requestedBy`
- `role`
- `commandType`: `call_floor | set_service_mode | clear_fault | lock_elevator | unlock_elevator | simulate_event`
- `parameters`
- `policyDecision`
- `status`: `pending | accepted | rejected | executing | succeeded | failed | timed_out`
- `requestedAt`
- `updatedAt`
- `correlationId`

## State Transitions

- Live state: `loading -> ready -> stale | degraded -> resyncing -> ready`
- Playback state: `inactive -> loading -> active -> partial | unavailable -> inactive`
- Command lifecycle: `pending -> accepted | rejected -> executing -> succeeded | failed | timed_out`
- Fault lifecycle: `active -> acknowledged -> cleared`
