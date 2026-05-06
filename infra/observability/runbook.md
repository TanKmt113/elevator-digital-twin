# Operations Runbook

## Core Checks

- Verify backend health endpoint and realtime session status.
- Check alert throughput and stale elevator state indicators.
- Check predictive risk publication metrics and history query load dashboards.

## Phase 7 Realtime Checks

- Confirm `/health` exposes `dittoHttpState`, `dittoLiveState`, `frontendRealtimeState`, `activeSessions`, and rejection counters.
- If the dashboard is not updating after a Ditto change, determine whether the failure is:
  - Twin ingestion failure: `dittoLiveState` degraded or stale, no growth in published elevator events
  - Browser delivery failure: `frontendRealtimeState` degraded or active sessions unexpectedly zero
  - Scope rejection: out-of-scope counter grows while the active building view remains unchanged
  - Malformed event rejection: malformed counter grows after replay or upstream change
- Use the developer replay route or `infra/ditto/replay-ditto-event.ts` before debugging browser code to verify backend publication.

## Phase 2 Failure Modes

- Twin bootstrap degraded: backend readiness should identify the bootstrap failure while the dashboard preserves the last accepted elevator state.
- Realtime stale: check `system.connection.state` events and stale elevator indicators before restarting services.
- Analytics degraded: inspect rejected warning counts and confirm AI responses include `modelVersion` and `modelTrace`.
- Dashboard unverified warning: treat missing validation metadata as a release-readiness failure, not a model prediction failure.
