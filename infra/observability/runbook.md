# Operations Runbook

## Core Checks

- Verify backend health endpoint and realtime session status.
- Check alert throughput and stale elevator state indicators.
- Check predictive risk publication metrics and history query load dashboards.

## Phase 2 Failure Modes

- Twin bootstrap degraded: backend readiness should identify the bootstrap failure while the dashboard preserves the last accepted elevator state.
- Realtime stale: check `system.connection.state` events and stale elevator indicators before restarting services.
- Analytics degraded: inspect rejected warning counts and confirm AI responses include `modelVersion` and `modelTrace`.
- Dashboard unverified warning: treat missing validation metadata as a release-readiness failure, not a model prediction failure.
