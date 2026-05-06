# Research: Realtime Risk Engine

**Feature**: `010-risk-engine` | **Date**: 2026-05-06

## Decision 1: Use deterministic rules for v1

**Decision**: Implement v1 as a deterministic rule engine that evaluates accepted elevator state snapshots.

**Rationale**: The project already has realtime Ditto ingestion, normalized elevator state, and a simulator that can produce meaningful operating conditions. Rule-based scoring is transparent, testable, and does not require historical telemetry or `ai-service` readiness.

**Alternatives considered**:

- **Call `ai-service` immediately**: Rejected because model inputs, telemetry history, and validation workflow are not mature enough.
- **Only seed static warnings**: Rejected because it does not make `/analytics` respond to live sensor behavior.

## Decision 2: Evaluate after backend admission, not before normalization

**Decision**: Risk evaluation runs only after realtime events have been accepted, normalized, scoped, and stored as current elevator state.

**Rationale**: This preserves Twin authority and avoids duplicate, out-of-order, malformed, or out-of-scope events generating false warnings.

**Alternatives considered**:

- **Evaluate raw Ditto payloads**: Rejected because raw payloads can be partial or malformed and would duplicate normalization logic.
- **Evaluate in frontend**: Rejected by constitution; frontend must not contain operational risk business logic.

## Decision 3: Use active warning identity for duplicate suppression

**Decision**: Warnings are deduplicated by elevator, risk type, and active window. Equivalent warnings update or suppress rather than creating repeated rows.

**Rationale**: Realtime sensor streams can produce many similar states. Operators need one actionable warning per active condition.

**Alternatives considered**:

- **Emit every evaluation match**: Rejected because it floods analytics.
- **Global cooldown only**: Rejected because different risk types on the same elevator should be independently visible.

## Decision 4: Preserve existing RiskWarning trace shape

**Decision**: Generated rule warnings keep `modelVersion`, `validationRunId`, and `modelTrace` fields, using rule-engine identifiers rather than ML model identifiers.

**Rationale**: Existing analytics readiness already validates trace metadata. Keeping the same shape allows rule warnings and future AI warnings to share UI and API contracts.

**Alternatives considered**:

- **Create a separate RuleWarning type**: Rejected because it fragments analytics contracts.
- **Drop trace fields for rule warnings**: Rejected because warnings must be auditable and explainable.

## Decision 5: No persistent telemetry store in this phase

**Decision**: v1 evaluates the latest accepted state plus bounded in-memory condition history needed for repeated overload and duplicate suppression.

**Rationale**: The requested next step is realtime risk generation. Persistent telemetry history is important later, but not required for first useful rule-based warnings.

**Alternatives considered**:

- **Add Timescale/PostgreSQL telemetry persistence now**: Rejected because it expands scope and delays visible analytics value.
- **Stateless single-snapshot rules only**: Rejected because repeated overload needs a short condition window.
