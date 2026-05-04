# Quickstart: Smart Building Operations Dashboard

## Purpose

This guide describes the target developer workflow for the first implementation
slice of the Smart Building Operations Dashboard.

## Prerequisites

- Container runtime available for local infrastructure
- Node.js 22 LTS and package manager for frontend and backend work
- Python 3.12 for AI service development
- Access to a Ditto environment or a local Ditto-compatible development setup
- Access to MQTT test publishers or simulator feeds for elevator events

## Initial Bring-Up Order

1. Start infrastructure dependencies: Ditto, MQTT broker, MongoDB,
   TimescaleDB, Redis, and any local observability stack.
2. Start the backend service and verify it can authenticate, subscribe to Ditto
   events, and expose REST and WebSocket endpoints.
3. Start the frontend and confirm it renders elevator summary data through the
   backend only.
4. Start the AI service and verify it can read curated historical data and
   publish risk results through approved backend-facing interfaces.

## Implementation Sequence

1. Implement backend authentication, authorization, and Ditto event
   normalization before building end-user screens.
2. Implement the elevator list and detail dashboard using backend REST for
   initial hydration and WebSocket for live updates.
3. Add command submission and audit visibility with policy rejection handling.
4. Add alert generation, acknowledgement workflow, and history retrieval.
5. Add the 3D twin view with asset mapping bound to the centralized state store.
6. Add predictive risk display after telemetry history and analytics pipelines
   are stable.

## Verification Flow

1. Authenticate as an operator and load the dashboard.
2. Publish simulated elevator events and verify summary cards, list rows, and
   detail panels update without reload.
3. Issue a safe command and verify acknowledgement, command history, and final
   outcome visibility.
4. Trigger alert scenarios and verify severity mapping, acknowledgement, and
   audit history.
5. Open the 3D view and confirm position and status changes match the list view.
6. Query history for a chosen elevator and validate filtered results.
7. Publish predictive results and confirm authorized users can see the risk
   warning without any direct device action.

## Testing Expectations

- Run unit and integration tests for frontend store updates, backend command
  validation, and normalization logic on each implementation slice.
- Run contract tests against the REST API and realtime event shapes before
  integration with UI consumers.
- Run WebSocket and MQTT simulation tests for disconnect, duplicate event, and
  stale-state scenarios.
- Run k6 or equivalent performance tests before accepting the live monitoring
  and command path as production-ready.
