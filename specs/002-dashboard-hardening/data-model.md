# Data Model: Dashboard Hardening and Operational Readiness

## Overview

This phase extends the existing operations dashboard with explicit bootstrap and synchronization state, stronger projection semantics for the operator dashboard, and a verifiable analytics validation record.

## Entities

### TwinBootstrapSnapshot

**Purpose**: Represents the current authorized set of elevator state loaded from the operational Twin during initialization or refresh.

**Fields**
- `snapshotId` (string, required)
- `buildingId` (string, required)
- `source` (enum, required): `twin`
- `requestedAt` (timestamp, required)
- `completedAt` (timestamp, optional)
- `status` (enum, required): `loading`, `completed`, `partial`, `failed`
- `elevators` (array[ElevatorTwin], required)
- `missingElevatorIds` (array[string], optional)
- `failureReason` (string, optional)

**Validation**
- `source` is always Twin-derived for this phase.
- `completedAt` is required when `status=completed` or `status=partial`.
- `missingElevatorIds` is only present when the requested scope is incomplete.

### RealtimeSynchronizationState

**Purpose**: Tracks whether normalized elevator state is currently live, stale, degraded, or resynchronizing.

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
- `lastFailureReason` is populated only for non-healthy states.

### DashboardProjectionState

**Purpose**: The frontend-visible operator state that coordinates list, detail, alert, risk, and Twin-view rendering.

**Fields**
- `selectedBuildingId` (string, required)
- `selectedElevatorId` (string, optional)
- `layoutMode` (enum, required): `desktop`, `tablet`, `mobile`
- `dataState` (enum, required): `loading`, `ready`, `empty`, `degraded`
- `visibleAlertSeverity` (enum, optional): `info`, `warning`, `critical`
- `visiblePanelIds` (array[string], required)

**Validation**
- `dataState=empty` requires no visible elevator data in the active scope.
- `selectedElevatorId` must be a member of the active scope when set.

### AnalyticsValidationResult

**Purpose**: Captures one end-to-end predictive warning verification run.

**Fields**
- `validationRunId` (string, required)
- `elevatorId` (string, required)
- `modelVersion` (string, required)
- `startedAt` (timestamp, required)
- `completedAt` (timestamp, optional)
- `status` (enum, required): `pending`, `passed`, `failed`
- `riskWarningId` (string, optional)
- `failureStage` (enum, optional): `feature_generation`, `prediction`, `backend_ingestion`, `dashboard_render`
- `notes` (string, optional)

**Validation**
- `riskWarningId` is required when `status=passed`.
- `failureStage` is required when `status=failed`.
