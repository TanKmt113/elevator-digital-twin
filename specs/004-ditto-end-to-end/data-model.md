# Data Model: Ditto End-to-End Digital Twin Runtime

## Overview

This model defines the runtime entities needed to seed Ditto, bootstrap current state, consume live Twin events, deliver accepted updates to frontend clients, and make degraded conditions observable.

## Entities

### LocalTwinDataset

**Purpose**: Repeatable local validation dataset used to create or refresh Ditto policy and elevator Things.

**Fields**
- `datasetId` (string, required)
- `buildingId` (string, required)
- `policyId` (string, required)
- `elevators` (array[TwinElevatorThingSeed], required)
- `createdAt` (timestamp, required)

**Validation**
- `buildingId` must match the intended validation scope.
- Each elevator seed must include `thingId`, `attributes.buildingId`, and `features.elevator.properties`.
- Dataset must be safe to reapply without creating duplicate logical elevators.

### TwinElevatorThingSeed

**Purpose**: Source record for creating or replacing one elevator Thing in Ditto.

**Fields**
- `thingId` (string, required)
- `policyId` (string, required)
- `attributes.buildingId` (string, required)
- `attributes.deviceType` (string, required): `elevator`
- `features.elevator.properties.status` (enum, required)
- `features.elevator.properties.currentFloor` (integer, required)
- `features.elevator.properties.targetFloor` (integer, optional)
- `features.elevator.properties.direction` (enum, required)
- `features.elevator.properties.doorState` (enum, required)
- `features.elevator.properties.loadPercentage` (integer, optional)
- `features.elevator.properties.healthState` (enum, required)
- `features.elevator.properties.lastUpdatedAt` (timestamp, optional)

**Validation**
- Missing `buildingId` invalidates the seed record.
- Unknown operational enum values must be allowed only in negative validation fixtures.
- Floor values must fit the configured building range when available.

### TwinBootstrapRun

**Purpose**: Represents one backend attempt to load current elevator state from Ditto.

**Fields**
- `runId` (string, required)
- `buildingId` (string, required)
- `requestedAt` (timestamp, required)
- `completedAt` (timestamp, optional)
- `status` (enum, required): `loading`, `completed`, `partial`, `empty`, `failed`
- `admittedElevatorIds` (array[string], required)
- `rejectedThingIds` (array[string], optional)
- `failureReason` (string, optional)

**Validation**
- `completedAt` is required for terminal states.
- `failed` requires `failureReason`.
- `empty` requires zero admitted elevators and no transport failure.

### NormalizedElevatorState

**Purpose**: Backend-governed materialized state used by API, realtime publishing, and frontend projections.

**Fields**
- `elevatorId` (string, required)
- `buildingId` (string, required)
- `schemaVersion` (string, required)
- `deviceType` (string, required): `elevator`
- `status` (enum, required)
- `currentFloor` (integer, required)
- `targetFloor` (integer, optional)
- `direction` (enum, required)
- `doorState` (enum, required)
- `loadPercentage` (integer, optional)
- `healthState` (enum, required)
- `lastEventAt` (timestamp, required)
- `stale` (boolean, required)

**Validation**
- State is accepted only after building scope is known.
- Unknown enums normalize to governed fallback values.
- Newer accepted events must not be overwritten by older events.

### LiveTwinEvent

**Purpose**: Twin-originated event candidate before or after backend acceptance.

**Fields**
- `eventId` (string, required)
- `thingId` (string, required)
- `buildingId` (string, optional until projected)
- `schemaVersion` (string, required)
- `occurredAt` (timestamp, required)
- `payload` (object, required)
- `acceptanceStatus` (enum, required): `accepted`, `duplicate`, `out_of_order`, `out_of_scope`, `malformed`
- `rejectionReason` (string, optional)

**Validation**
- `accepted` requires a valid normalized elevator state.
- Duplicate detection uses stable event identity.
- Ordering rejection is evaluated per elevator identity.
- Out-of-scope events must not mutate active building state.

### RealtimeClientSession

**Purpose**: One authenticated frontend realtime connection.

**Fields**
- `sessionId` (string, required)
- `userId` (string, required)
- `role` (string, required)
- `buildingId` (string, required)
- `connectedAt` (timestamp, required)
- `lastMessageAt` (timestamp, optional)
- `connectionState` (enum, required): `connecting`, `live`, `stale`, `degraded`, `resyncing`, `closed`
- `closeReason` (string, optional)

**Validation**
- Session must have role authorized for elevator monitoring.
- Session building scope controls which events are delivered.
- Closed sessions must not receive events.

### SynchronizationHealth

**Purpose**: Operator and developer visible status for Twin and realtime delivery quality.

**Fields**
- `buildingId` (string, optional)
- `bootstrapStatus` (enum, required)
- `dittoHttpState` (enum, required): `unknown`, `reachable`, `degraded`
- `dittoLiveState` (enum, required): `disconnected`, `connecting`, `live`, `stale`, `degraded`
- `frontendRealtimeState` (enum, required): `no_sessions`, `live`, `degraded`
- `lastBootstrapAt` (timestamp, optional)
- `lastLiveEventAt` (timestamp, optional)
- `activeSessions` (integer, required)
- `duplicateEventsDropped` (integer, required)
- `outOfOrderEventsRejected` (integer, required)
- `outOfScopeEventsRejected` (integer, required)
- `malformedEventsRejected` (integer, required)
- `lastFailureReason` (string, optional)

**Validation**
- Counters are monotonically increasing during process lifetime.
- Degraded states include a failure reason where available.
- Health distinguishes Twin connectivity from backend-to-frontend delivery.
