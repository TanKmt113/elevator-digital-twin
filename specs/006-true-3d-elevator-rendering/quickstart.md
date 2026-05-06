# Quickstart: True 3D Elevator Rendering

## Purpose

Validate that the dashboard renders elevators as a true 3D building scene while preserving the existing Ditto-backed runtime, shared selection model, and degraded-state semantics.

## Prerequisites

- Local Ditto-backed runtime from phase 4 is working.
- Phase 005 scene/runtime contracts are already in place.
- Backend and frontend dependencies are installed.
- Backend developer auth and Ditto seed routes are available.
- AI service remains stopped for this validation path.
- Browser supports WebGL.

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
7. Confirm the dashboard loads current elevator state before opening the true 3D scene.

## Validation Flow

1. Confirm the scene shows a building-wide 3D arrangement of floors, shafts, and one cabin per seeded elevator.
2. Verify elevators on different floors appear at visibly different cabin heights.
3. Select an elevator from the list and confirm the camera enters selected focus for the same cabin.
4. Select an elevator from the 3D scene and confirm the detail context switches to that elevator.
5. Replay accepted live updates and confirm cabin position, motion cues, and door cues update in sync with list and detail views.
6. Trigger stale or degraded synchronization and confirm the scene preserves the last accepted cabin state with an explicit warning.
7. Verify overview reset returns to a predictable building-wide camera view.
8. Repeat focus changes and live updates and confirm the scene remains responsive without render loops or prolonged frozen frames.

## Expected Outputs

- The scene renders true 3D cabins inside a readable building layout.
- Shared selection stays synchronized across list, detail, and 3D surfaces.
- Camera focus is predictable in overview and selected-elevator modes.
- Live updates appear consistently in cabin position and visual state cues.
- Stale, degraded, empty, and unavailable scene states are explicit.
- Frontend continues to access Twin state only through backend-mediated APIs and realtime flows.

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

Manual validation remains required because this phase depends on WebGL capability, live updates, camera behavior, and operator interaction.
