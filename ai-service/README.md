# AI Service

Predictive maintenance service workspace.

## Phase 2 Validation

- Keep the service aligned with [../specs/002-dashboard-hardening/spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/spec.md).
- Validate warning flow through [../specs/002-dashboard-hardening/quickstart.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/quickstart.md).
- Preserve model-version traceability in outputs consumed by the backend and dashboard.

## Local Checks

- Install test tooling with `python3 -m pip install -e ".[dev]"`.
- Run predictive validation coverage with `python3 -m pytest tests/test_risk_pipeline.py`.

Risk responses include `riskWarningId`, `elevatorId`, `generatedAt`, `modelVersion`, `validationRunId`, and a `modelTrace` object with feature-set and scored-at metadata.
