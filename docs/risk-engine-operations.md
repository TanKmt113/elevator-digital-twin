# Risk Engine Operations

## Scope

The v1 Risk Engine is a deterministic backend rule engine for predictive maintenance. It evaluates backend-accepted elevator Twin state only; it does not call `ai-service` and the frontend never evaluates raw Ditto payloads.

## Rules

- Door blockage: `doorState=blocked` or `doorObstruction=true`
- Active fault: `faultCode` present or `healthState=critical`
- Thermal risk: motor/controller temperature above configured thresholds
- Vibration risk: vibration level above configured thresholds
- Repeated overload: repeated accepted observations above the overload threshold

## Warning Contract

Generated warnings are `alarm` data-class records with:

- `riskWarningId`
- `elevatorId`
- `buildingId`
- `riskType`
- `riskLevel`
- `predictedWindowHours`
- `drivers`
- `modelVersion`
- `validationRunId`
- `modelTrace`
- `verificationStatus`

`modelVersion` and `modelTrace` identify the rule engine version in v1, not an ML model.

## Duplicate Handling

The active warning identity is elevator plus risk type. Equivalent warnings inside the active window are suppressed and counted. If severity worsens, the active warning is updated with the higher severity and latest trace.

## Metrics

- `risk_evaluation_total`
- `risk_warning_generated_total`
- `risk_warning_ingested_total`
- `risk_warning_rejected_total`
- `risk_warning_suppressed_total`
- `risk_warning_published_total`
- `risk_warning_publish_failed_total`

## Readiness

`GET /analytics/risk/readiness` reports:

- `status=ready` when warning ingestion is healthy
- `status=degraded` after validation, persistence, or publication failures
- accepted, rejected, and suppressed warning counts
- last model/rule version and last failure reason

Elevator monitoring and the 3D scene must continue updating even when risk generation fails.
