# Data Model: Smart Building Operations Dashboard

## Overview

The feature uses Ditto-managed live state for canonical operational truth and
adds application-owned models for command audit, historical analysis, alert
tracking, and predictive risk presentation.

## Entities

### ElevatorTwin

**Purpose**: Canonical operational view of an elevator exposed to backend and UI
consumers after normalization.

**Fields**
- `elevatorId` (string, required): Stable asset identifier.
- `buildingId` (string, required): Building scope for authorization and routing.
- `schemaVersion` (string, required): Contract version, initial value `1.0.0`.
- `deviceType` (string, required): Fixed value `elevator`.
- `status` (enum, required): `idle`, `moving`, `door_open`, `maintenance`,
  `fault`, `offline`.
- `currentFloor` (integer, required): Current reported floor.
- `targetFloor` (integer, optional): Intended destination if known.
- `direction` (enum, required): `up`, `down`, `stationary`, `unknown`.
- `doorState` (enum, required): `open`, `closed`, `opening`, `closing`,
  `blocked`, `unknown`.
- `loadPercentage` (number, optional): Current load percentage from telemetry.
- `healthState` (enum, required): `normal`, `warning`, `critical`, `unknown`.
- `lastEventAt` (timestamp, required): Timestamp of latest accepted state event.
- `stale` (boolean, required): True when live updates are outside freshness
  threshold.

**Relationships**
- One `ElevatorTwin` has many `ElevatorEvent`, `ControlCommand`, `Alert`,
  `HistoricalTelemetryPoint`, and `RiskWarning` records.
- One `ElevatorTwin` belongs to one `BuildingScope`.

**Validation**
- `schemaVersion` and `deviceType` are mandatory on every normalized payload.
- `currentFloor` must stay within configured building floor ranges.
- `status=fault` or `offline` may restrict command eligibility.

### ElevatorEvent

**Purpose**: Immutable record of a normalized event flowing from Ditto or
backend command processing.

**Fields**
- `eventId` (string, required)
- `elevatorId` (string, required)
- `eventType` (enum, required): `state_changed`, `telemetry`, `alarm`,
  `command_ack`, `command_result`, `connectivity_changed`
- `dataClass` (enum, required): `realtime`, `telemetry`, `config`, `alarm`
- `source` (enum, required): `ditto`, `backend`, `ai-service`
- `occurredAt` (timestamp, required)
- `receivedAt` (timestamp, required)
- `payloadVersion` (string, required)
- `payload` (object, required)
- `correlationId` (string, optional)

**Validation**
- Events are append-only and never updated in place.
- Duplicate detection uses `eventId` or a deterministic correlation strategy.

### ControlCommand

**Purpose**: Authorized supervisory command issued by an operator.

**Fields**
- `commandId` (string, required)
- `elevatorId` (string, required)
- `issuedByUserId` (string, required)
- `commandType` (enum, required): `move_to_floor`, `stop`, `reset`
- `requestedFloor` (integer, optional): Required when `commandType=move_to_floor`
- `status` (enum, required): `accepted`, `rejected`, `in_progress`,
  `completed`, `failed`, `expired`
- `rejectionReason` (string, optional)
- `issuedAt` (timestamp, required)
- `lastUpdatedAt` (timestamp, required)
- `correlationId` (string, required)
- `auditMetadata` (object, required)

**Validation**
- Commands cannot be accepted for elevators in prohibited critical states.
- `requestedFloor` must exist within the building floor map.
- Every state change must be audit logged.

**State Transitions**
- `accepted -> in_progress -> completed`
- `accepted -> failed`
- `accepted -> expired`
- `rejected` is terminal

### Alert

**Purpose**: Actionable abnormal condition visible to operators and maintenance
users.

**Fields**
- `alertId` (string, required)
- `elevatorId` (string, required)
- `alertType` (enum, required): `overload`, `motor_overheating`,
  `stuck_elevator`, `emergency_stop`, `predictive_risk`
- `severity` (enum, required): `info`, `warning`, `critical`
- `status` (enum, required): `open`, `acknowledged`, `resolved`, `suppressed`
- `message` (string, required)
- `createdAt` (timestamp, required)
- `acknowledgedAt` (timestamp, optional)
- `acknowledgedByUserId` (string, optional)
- `details` (object, optional)

**Validation**
- `overload`, `motor_overheating`, `stuck_elevator`, and `emergency_stop` map
  to severity rules defined by operations policy.
- Acknowledgement requires an authorized user and preserves audit history.

### HistoricalTelemetryPoint

**Purpose**: Queryable historical snapshot for movement, utilization, and
performance analysis.

**Fields**
- `pointId` (string, required)
- `elevatorId` (string, required)
- `recordedAt` (timestamp, required)
- `currentFloor` (integer, optional)
- `direction` (enum, optional)
- `doorState` (enum, optional)
- `loadPercentage` (number, optional)
- `temperature` (number, optional)
- `vibrationScore` (number, optional)
- `tripCount` (integer, optional)
- `sourceEventId` (string, required)

**Validation**
- Stored as immutable time-series data.
- Missing fields are allowed when telemetry is partial, but `recordedAt`,
  `elevatorId`, and `sourceEventId` are required.

### RiskWarning

**Purpose**: Maintenance-facing prediction output based on curated historical
and twin-derived features.

**Fields**
- `riskWarningId` (string, required)
- `elevatorId` (string, required)
- `riskLevel` (enum, required): `low`, `moderate`, `high`, `critical`
- `predictedWindowHours` (integer, required)
- `drivers` (array[string], optional)
- `status` (enum, required): `active`, `dismissed`, `expired`
- `generatedAt` (timestamp, required)
- `expiresAt` (timestamp, optional)
- `modelVersion` (string, required)

**Validation**
- Predictions are advisory and cannot trigger direct device control.
- Every record must include `modelVersion` and a target attention window.

### UserRoleAssignment

**Purpose**: Authorization scope for operators, admins, and maintenance users.

**Fields**
- `userId` (string, required)
- `role` (enum, required): `operator`, `admin`, `maintenance`
- `buildingId` (string, required)
- `assetScopes` (array[string], optional)
- `permissions` (array[string], required)
- `active` (boolean, required)

**Validation**
- Only authorized roles may issue commands or acknowledge alerts.
- Asset-scoped restrictions override broad role defaults when both exist.
