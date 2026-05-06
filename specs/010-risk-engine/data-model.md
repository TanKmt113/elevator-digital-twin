# Data Model: Realtime Risk Engine

**Feature**: `010-risk-engine`

## Entities

### ElevatorRiskInput

Represents one backend-accepted elevator state snapshot used for risk evaluation.

| Field | Type | Notes |
|-------|------|-------|
| `elevatorId` | string | Canonical elevator identity |
| `buildingId` | string? | Building scope used for authorization and grouping |
| `status` | enum/string | Current normalized operating status |
| `doorState` | enum/string | Used for door blockage and transition rules |
| `doorObstruction` | boolean? | Optional direct obstruction signal |
| `loadPercentage` | number? | Used for overload rules |
| `motorTempC` | number? | Used for thermal rules |
| `controllerTempC` | number? | Used for thermal rules |
| `vibrationLevel` | number? | Used for vibration rules |
| `faultCode` | string? | Direct fault driver |
| `faultSeverity` | string? | Severity hint |
| `healthState` | enum/string | Existing health signal |
| `lastUpdatedAt` / event timestamp | ISO-8601? | Freshness and trace reference |
| `stale` | boolean? | Stale inputs are not evaluated for new warnings |

Validation rules:

- Missing optional numeric fields do not fail evaluation; rules requiring those fields simply do not match.
- Non-finite numeric values are treated as missing.
- Stale or out-of-scope state is not a valid input for new risk warnings.

### RiskRule

Deterministic rule definition.

| Field | Type | Notes |
|-------|------|-------|
| `ruleId` | string | Stable identifier, e.g. `door.blocked.v1` |
| `ruleVersion` | string | Used in trace metadata |
| `riskType` | string | Door, fault, thermal, vibration, overload |
| `requiredSignals` | string[] | Inputs needed for the rule |
| `severityMapping` | object | Maps matched condition to risk level |
| `predictedWindowHours` | number | Operational risk horizon |
| `driverTemplate` | string | Human-readable driver label |

Initial rule set:

- Door blockage: `doorState=blocked` or `doorObstruction=true`
- Active fault: `faultCode` present or `healthState=critical`
- Thermal risk: `motorTempC` or `controllerTempC` above warning/critical thresholds
- Vibration risk: `vibrationLevel` above warning/critical thresholds
- Repeated overload: `loadPercentage` above threshold for multiple accepted observations

### RiskDriver

Explanation attached to a warning.

| Field | Type | Notes |
|-------|------|-------|
| `driverId` | string | Stable identifier |
| `label` | string | Operator-readable explanation |
| `signal` | string | Source signal name |
| `observedValue` | string/number/boolean | Redacted observed value |
| `threshold` | string/number? | Rule threshold when applicable |
| `severityContribution` | enum | `low`, `moderate`, `high`, `critical` |

### RiskWarning

Active predictive-maintenance warning.

| Field | Type | Notes |
|-------|------|-------|
| `riskWarningId` | string | Stable active warning identity |
| `elevatorId` | string | Affected elevator |
| `riskLevel` | enum | `low`, `moderate`, `high`, `critical` |
| `predictedWindowHours` | number | Risk horizon |
| `generatedAt` | ISO-8601 | Creation/update timestamp |
| `drivers` | RiskDriver[] or string[] | Explanations for warning |
| `modelVersion` | string | Rule engine version for v1 |
| `validationRunId` | string | Validation/build identifier |
| `verificationStatus` | enum | `verified`, `unverified`, `failed` |
| `modelTrace` | object | Trace with feature set, scored timestamp, validation status |
| `status` | enum | `active`, `dismissed`, `expired` |

State rules:

- Equivalent active warnings for the same elevator and risk type are suppressed or updated.
- Worsening severity updates the active warning.
- Returning to normal stops new warnings; explicit resolution is deferred to maintenance workflow.

## Relationships

```text
ElevatorRiskInput 1..* -> RiskRule evaluation
RiskRule match 1..* -> RiskDriver
RiskDriver 1..* -> RiskWarning
RiskWarning -> Analytics REST and realtime event
```

## Data Classes

- Reads: `realtime`, `telemetry`
- Writes: `alarm`
- Does not write: `config`
