# Quickstart: 3D Operations Runtime

## Purpose

Validate that the dashboard's 3D scene is usable as an operator-facing monitoring surface on top of the existing Ditto-backed runtime.

## Prerequisites

- Local Ditto-backed runtime from phase 4 is working.
- Backend and frontend dependencies are installed.
- Backend developer auth and Ditto seed routes are available.
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
3. Seed local Ditto data with `POST /dev/ditto/seed`.
4. Request an operator token with `POST /dev/auth/operator-token`.
5. Export that token into the frontend environment as `VITE_OPERATOR_TOKEN`.
6. Start the frontend with `cd frontend && npm run dev`.
7. Confirm the dashboard loads current elevator state and the Twin scene is not empty.

## Validation Flow

1. Confirm the scene shows one visible elevator representation per seeded elevator.
2. Verify elevators on different floors are distinguishable spatially.
3. Select an elevator from the list and confirm the same elevator is focused in the 3D scene.
4. Select an elevator from the 3D scene and confirm the detail context switches to that elevator.
5. Replay accepted live updates and confirm the 3D scene updates in sync with list and detail views.
6. Trigger stale or degraded synchronization and confirm the scene preserves the last accepted state with an explicit warning.
7. Repeatedly change selection and confirm focus remains stable without render loops or visible scene resets.

## Expected Outputs

- The scene is readable as a building-wide operational overview.
- Selection is synchronized across list, detail, and 3D surfaces.
- Live updates appear consistently in all dashboard projections.
- Stale and degraded conditions are visible in the scene.
- The scene remains responsive under representative local load.
- The frontend reaches operational state only through backend APIs and backend-mediated realtime state, not direct Ditto calls.

## Validation Commands

```sh
cd backend
npm run validate:phase5
```

```sh
cd frontend
npm run validate:phase5
```

Equivalent direct workspace commands:

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

Manual validation remains required because this phase depends on operator interaction, live updates, and 3D presentation behavior.
