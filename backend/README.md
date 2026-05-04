# Backend

API gateway and realtime orchestration workspace for smart building operations.

## Phase 2 Environment

- `DITTO_HTTP_URL`: Ditto HTTP API base URL used for current-state bootstrap
- `DITTO_WS_URL`: Ditto WebSocket endpoint used for live synchronization
- `DITTO_USERNAME`: Optional Ditto basic-auth username
- `DITTO_PASSWORD`: Optional Ditto basic-auth password
- `DITTO_BEARER_TOKEN`: Optional Ditto bearer token; takes precedence over basic auth
- `DITTO_BOOTSTRAP_TIMEOUT_MS`: Timeout budget for startup Twin bootstrap
- `TWIN_SYNC_ENABLED`: Set to `false` to disable Twin bootstrap and live sync in controlled local runs

## Phase 2 Validation

- Use [../docs/ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md) for Twin mapping expectations.
- Use [../specs/002-dashboard-hardening/quickstart.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/quickstart.md) for readiness and degraded-state validation flow.
