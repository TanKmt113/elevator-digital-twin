# Contract: Risk Engine Evaluation

## Purpose

Define the backend-internal contract for evaluating accepted elevator state and generating predictive-maintenance warnings.

## Evaluation Input

The engine receives one accepted normalized elevator state after backend admission.

Required fields:

- `elevatorId`
- `status`
- `currentFloor`
- `direction`
- `doorState`
- `healthState`
- `stale`

Optional risk signals:

- `buildingId`
- `doorObstruction`
- `loadPercentage`
- `motorTempC`
- `controllerTempC`
- `vibrationLevel`
- `faultCode`
- `faultSeverity`
- `lastFaultAt`
- event or state timestamp

## Evaluation Output

The engine returns zero or more candidate warnings.

Each candidate warning must include:

- `riskWarningId`
- `elevatorId`
- `riskLevel`
- `predictedWindowHours`
- `generatedAt`
- `drivers`
- `modelVersion`
- `validationRunId`
- `verificationStatus`
- `modelTrace.featureSet`
- `modelTrace.scoredAt`
- `modelTrace.validationStatus`
- `status`

## Initial Rule Semantics

### Door Blockage

Match when:

- `doorState` is `blocked`, or
- `doorObstruction` is `true`

Expected output:

- Risk level: `high` or `critical` depending on fault and health context
- Driver: door blockage
- Window: short operational window, recommended 24 hours or less

### Active Fault

Match when:

- `faultCode` is present, or
- `healthState` is `critical`

Expected output:

- Risk level follows `faultSeverity` where present
- Driver: active fault code or critical health state

### Thermal Risk

Match when:

- `motorTempC` or `controllerTempC` crosses warning or critical thresholds

Expected output:

- Risk level: `moderate`, `high`, or `critical`
- Driver: motor/controller temperature with observed value and threshold

### Vibration Risk

Match when:

- `vibrationLevel` crosses warning or critical thresholds

Expected output:

- Risk level: `moderate`, `high`, or `critical`
- Driver: vibration with observed value and threshold

### Repeated Overload

Match when:

- `loadPercentage` remains above overload threshold across the bounded active window

Expected output:

- Risk level: `moderate` or `high`
- Driver: repeated overload with observation count/window

## Duplicate Suppression

The engine or ingestion layer must avoid more than one active warning for the same:

- elevator
- risk type
- active condition window

If severity worsens, the active warning should update to the higher severity and latest drivers.

## Failure Behavior

- Missing optional signals skip only rules that require those signals.
- Invalid numeric values are treated as missing.
- Stale state must not create new warnings.
- Risk evaluation failure must not block elevator state publication.
- Warning persistence or publication failure must degrade analytics readiness.
