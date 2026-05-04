# Quickstart: Ditto End-to-End Digital Twin Runtime

## Purpose

Validate that a local Ditto-backed Digital Twin runtime can bootstrap current elevator state, deliver live updates to the dashboard, recover from realtime disruption, and keep list/detail/3D projections synchronized without requiring AI services.

## Prerequisites

- Local Docker runtime available.
- Backend and frontend dependencies installed.
- Ditto service reachable from backend.
- AI service remains stopped for this validation path.

## Environment

Backend environment:

```sh
PORT=3000
JWT_SECRET=change-me
DITTO_HTTP_URL=http://localhost:8080
DITTO_WS_URL=ws://localhost:8080/ws/2
DITTO_USERNAME=ditto
DITTO_PASSWORD=ditto
TWIN_SYNC_ENABLED=true
DITTO_BOOTSTRAP_TIMEOUT_MS=5000
DEV_AUTH_ENABLED=true
```

Frontend environment:

```sh
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
VITE_BUILDING_ID=L72
```

## Bring-Up

1. Start local infrastructure including Ditto.
2. Seed or refresh the `L72` elevator Things in Ditto using the local seed dataset.
3. Start the backend.
4. Confirm `/health` reports Ditto HTTP reachable and bootstrap `completed`, `partial`, `empty`, or `failed`.
5. Issue a local operator token when developer auth is enabled.
6. Start the frontend with the token and active building scope.
7. Confirm the dashboard loads current elevator state from backend REST before live updates arrive.
8. Confirm the frontend websocket reaches `live`.

## Validation Flow

1. Load the dashboard as an operator scoped to `L72`.
2. Confirm elevator list, detail panel, summary cards, and 3D scene show the same bootstrapped state.
3. Replay a live movement update for one elevator through Ditto.
4. Confirm the list, detail panel, and 3D scene update within the realtime target.
5. Replay duplicate and out-of-order updates.
6. Confirm no duplicate or regressive UI transition appears and rejection counters increase.
7. Replay an out-of-scope building update.
8. Confirm the active dashboard does not change.
9. Stop backend-to-frontend realtime delivery or close the browser websocket.
10. Confirm the dashboard shows stale/reconnecting state while preserving last accepted elevator state.
11. Restore realtime delivery.
12. Confirm the dashboard resyncs from backend state and returns to live.

## Expected Outputs

- Backend health distinguishes Twin HTTP, Twin live, and frontend realtime state.
- Dashboard current state appears without waiting for a new event.
- Accepted live events update list, detail, summary, and 3D consistently.
- Duplicate, late, malformed, and out-of-scope events do not mutate UI state.
- Degraded and reconnecting states are explicit.
- AI service is not started and is not required.

## Validation Commands

```sh
cd backend
npm run build
npm test
```

```sh
cd frontend
npm run build
npm test
```

Manual quickstart validation is required after automated tests because this phase crosses Ditto, backend, websocket, and browser boundaries.
