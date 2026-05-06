# Enhanced Elevator Twin Data Classes

Feature 008 keeps Ditto behind the backend and exposes only normalized backend contracts to the frontend.

## realtime

- Reads: Ditto elevator Thing attributes/features, backend materialized elevator state, session scope.
- Writes: `elevator.state.changed`, `system.connection.state`, `dashboard.resync.required`.
- Guardrails: partial Ditto events are hydrated or merged before publication; out-of-scope, duplicate, out-of-order, malformed, hydration, and normalization failures are counted.

## telemetry

- Reads: enhanced telemetry samples such as position, speed, door percent, load, temperature, power, and vibration.
- Writes: bounded playback snapshots and optional `elevator.telemetry.sampled` diagnostics.
- Guardrails: missing fields are surfaced as partial history with `missingFields`.

## config

- Reads: building scope, command policy, elevator command preconditions, runtime thresholds.
- Writes: `elevator.command.status` lifecycle events and audit records with correlation IDs.
- Guardrails: commands require backend authorization, policy evaluation, and audit before any operator-facing success state.

## alarm

- Reads: fault code, severity, subsystem health, stale/degraded synchronization state.
- Writes: fault/health cues in detail, list, realtime diagnostics, and 3D projection tones.
- Guardrails: invalid or stale state preserves the last accepted Twin state and shows degraded/stale feedback.
