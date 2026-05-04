# Quickstart: Dashboard Hardening and Operational Readiness

## Purpose

This guide validates the phase-2 completion path for the Smart Building Operations Dashboard.

## Bring-Up Order

1. Start infrastructure dependencies, including the Twin-compatible environment, MongoDB, TimescaleDB, Redis, and MQTT.
2. Start the backend and confirm it reaches health readiness, including Twin bootstrap attempt reporting.
3. Start the frontend and confirm the dashboard renders loading, ready, empty, or degraded states explicitly.
4. Start the AI service and prepare curated telemetry or fixtures for predictive validation.

## Validation Flow

1. Authenticate as an operator scoped to a building.
2. Load the dashboard and confirm current elevator state appears from bootstrap before new live updates are required.
3. Replay live elevator changes and verify list, detail, and Twin-view state remain consistent.
4. Induce delayed or missing Twin delivery and confirm stale or degraded indicators appear.
5. Review alert and risk panels in desktop and tablet-sized layouts and confirm the main monitoring workflow remains legible and usable.
6. Run the predictive validation path and confirm a warning is ingested, visible, and traceable to a model version.

## Expected Outputs

- Backend logs identify bootstrap success or failure.
- Dashboard surfaces explicit loading, empty, ready, and degraded states.
- Realtime updates reconcile against bootstrapped state without duplicate UI transitions.
- Predictive warnings appear in the authorized dashboard flow with verifiable model metadata.
