# Data Model: Ditto Realtime Synchronization

## Live Twin Change

**Purpose**: Represents one Twin-originated elevator state change before acceptance is finalized.

**Fields**

- `eventId`: string, required, unique event identifier
- `occurredAt`: ISO-8601 timestamp, required
- `elevatorId`: string, required
- `buildingId`: string, required
- `schemaVersion`: string, required
- `payloadClass`: enum `realtime`
- `candidateState`: object, required, normalized elevator candidate values
- `correlationId`: string, optional

**Validation Rules**

- `buildingId`, `elevatorId`, and `occurredAt` are required for ordering and scope checks.
- Candidate values must be normalized into governed enums and number ranges before acceptance.
- A change without minimum identity or ordering fields is rejected and never mutates materialized state.

## Accepted Elevator State

**Purpose**: Represents the latest backend-governed elevator state visible to dashboard clients.

**Fields**

- `elevatorId`: string, required
- `buildingId`: string, required
- `schemaVersion`: string, required
- `deviceType`: fixed value `elevator`
- `status`: governed operational status
- `currentFloor`: integer, required
- `targetFloor`: integer, optional
- `direction`: governed movement direction
- `doorState`: governed door state
- `loadPercentage`: number, optional
- `healthState`: governed health state
- `lastEventAt`: ISO-8601 timestamp, required
- `stale`: boolean, required

**Validation Rules**

- Only accepted live changes or bootstrapped state may update this model.
- `lastEventAt` must not move backward for the same elevator.
- This state is the only source used by REST bootstrap, summary, detail, and 3D projections.

## Realtime Session

**Purpose**: Represents one authorized dashboard connection subscribed to backend-managed live delivery.

**Fields**

- `sessionId`: string, required
- `buildingScope`: string, required
- `roleScope`: string, required
- `connectionState`: enum `connecting | live | stale | degraded | resyncing`
- `connectedAt`: ISO-8601 timestamp, required
- `lastDeliveredEventAt`: ISO-8601 timestamp, optional
- `lastResyncAt`: ISO-8601 timestamp, optional
- `deliveryHealth`: enum `healthy | interrupted | recovering`

**Validation Rules**

- Sessions receive only events matching `buildingScope`.
- Unauthorized or expired sessions must not remain subscribed.
- `resyncing` is temporary and should converge back to `live` or `degraded`.

## Synchronization Status

**Purpose**: Captures operator-visible realtime health for the active dashboard scope.

**Fields**

- `buildingId`: string, optional
- `bootstrapStatus`: enum `idle | loading | completed | partial | empty | failed`
- `connectionState`: enum `connecting | live | stale | degraded | resyncing`
- `dataState`: enum `loading | ready | empty | degraded`
- `lastBootstrapAt`: ISO-8601 timestamp, optional
- `lastLiveEventAt`: ISO-8601 timestamp, optional
- `duplicateEventsDropped`: integer
- `outOfOrderEventsRejected`: integer
- `outOfScopeEventsRejected`: integer
- `malformedEventsRejected`: integer
- `lastFailureReason`: string, optional

**Validation Rules**

- `connectionState` reflects the delivery health of accepted live updates, not only initial bootstrap.
- Rejection counters are monotonic within a runtime instance.
- `dataState` does not drop to empty solely because live delivery is interrupted if accepted state is still present.

## Resynchronization Snapshot

**Purpose**: Represents a backend-provided current-state refresh used after reconnect or suspected missed delivery.

**Fields**

- `snapshotId`: string, required
- `buildingId`: string, required
- `requestedAt`: ISO-8601 timestamp, required
- `completedAt`: ISO-8601 timestamp, optional
- `reason`: string, required
- `items`: array of Accepted Elevator State, required
- `status`: enum `completed | partial | failed`

**Validation Rules**

- The snapshot must reflect the latest accepted materialized state for the building scope.
- Snapshot application must replace stale client projections for the building scope atomically.
- Failed resync must transition the session to explicit degraded behavior rather than silently pretending to be live.
