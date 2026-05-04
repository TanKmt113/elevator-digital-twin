# Quickstart: Digital Twin and 3D Operations View

## Purpose

This guide validates the next phase of the Smart Building Operations Dashboard: Digital Twin bootstrap, live synchronization, and 3D operator inspection without requiring AI services.

## Bring-Up Order

1. Start infrastructure dependencies, including the Twin-compatible environment and realtime support.
2. Start the backend and confirm it reports Twin bootstrap readiness.
3. Start the frontend and confirm the dashboard renders explicit loading, ready, empty, stale, or degraded states.
4. Do not start the AI service for this validation path.

## Validation Flow

1. Authenticate as an operator scoped to a building.
2. Load the dashboard and confirm current elevator state appears from Twin bootstrap before new live events are required.
3. Replay a live elevator state update and verify the list, detail panel, and 3D scene update consistently.
4. Select an elevator in the list and confirm the 3D scene focuses the same elevator.
5. Select an elevator in the 3D scene and confirm the detail panel shows the same elevator.
6. Replay duplicate, out-of-order, or out-of-scope events and confirm they do not create duplicate or inconsistent UI transitions.
7. Induce delayed or missing Twin delivery and confirm stale or degraded indicators appear while the last accepted state remains visible.

## Expected Outputs

- Backend readiness identifies Twin bootstrap success, partial state, empty scope, or failure.
- Dashboard surfaces explicit loading, empty, ready, stale, and degraded states.
- Realtime updates reconcile against bootstrapped state without duplicate UI transitions.
- 3D scene renders a non-empty elevator projection when elevator state exists.
- List, detail panel, and 3D scene share one selected elevator context.
- The validation path completes without starting or depending on the AI service.

## Validation Commands

- Backend: `cd backend && npm run validate:phase3`
- Frontend: `cd frontend && npm run validate:phase3`

The AI service is intentionally excluded from these commands.
