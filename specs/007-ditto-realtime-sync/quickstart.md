# Quickstart: Ditto Realtime Synchronization

## Purpose

Validate that a running dashboard updates automatically when Ditto elevator state changes, rejects invalid live events safely, and resynchronizes after realtime interruption without requiring a page reload.

## Prerequisites

- Local Ditto service is running and reachable from the backend.
- Backend and frontend dependencies are installed.
- A seeded `L72` elevator dataset is available in Ditto.
- Developer auth path is available for local operator sessions.
- AI service remains stopped for this validation path.

## Environment

Backend environment:

```sh
PORT=3000
JWT_SECRET=change-me
DEV_AUTH_ENABLED=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DITTO_HTTP_URL=http://localhost:8080
DITTO_WS_URL=ws://localhost:8080/ws/2
DITTO_USERNAME=ditto
DITTO_PASSWORD=ditto
TWIN_SYNC_ENABLED=true
DITTO_BOOTSTRAP_TIMEOUT_MS=5000
```

Frontend environment:

```sh
VITE_API_BASE_URL=http://localhost:3000
VITE_BUILDING_ID=L72
VITE_OPERATOR_ROLE=operator
```

## Bring-Up

1. Start local infrastructure and Ditto.
2. Start backend with `cd backend && npm run dev`.
3. Seed local Ditto data with the existing developer seed path.
4. Request an operator token from the developer auth route.
5. Export that token into the frontend environment.
6. Start the frontend with `cd frontend && npm run dev`.
7. Confirm the dashboard finishes initial bootstrap before testing live propagation.

## Validation Flow

1. Open one dashboard session scoped to `L72`.
2. Confirm current elevator state appears in summary, list, detail, and 3D views.
3. Change one elevator's state in Ditto.
4. Confirm the changed elevator updates in all dashboard surfaces within the realtime target and without refreshing the page.
5. Open a second dashboard session and repeat a Ditto change.
6. Confirm both sessions reflect the same accepted update.
7. Replay duplicate, malformed, late, and out-of-scope live changes.
8. Confirm the active dashboard does not regress or replay duplicate transitions and that health or counters reflect the rejections.
9. Interrupt browser realtime delivery or backend live delivery.
10. Confirm the dashboard moves to `stale` or `degraded` while preserving the last accepted elevator state.
11. Restore connectivity.
12. Confirm the dashboard performs resynchronization, returns to `live`, and preserves selected-elevator context when still in scope.

## Expected Outputs

- Ditto live changes appear in the dashboard without manual reload.
- All connected sessions for the same building scope remain synchronized.
- Rejected live changes do not create visible false transitions.
- Realtime interruption becomes explicit through stale, resyncing, or degraded status.
- Recovery restores the latest accepted state through backend-mediated resync.

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

Manual validation remains required because this feature crosses Ditto, backend-managed realtime delivery, browser connectivity, and 3D projection behavior.
