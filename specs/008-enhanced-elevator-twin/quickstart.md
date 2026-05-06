# Quickstart: Enhanced Elevator Digital Twin

## Purpose

Validate that detailed elevator Twin state flows from Ditto through the backend into list, detail, 3D, playback, and command surfaces without direct frontend Ditto access.

## Prerequisites

- Local Ditto service is running.
- Backend and frontend dependencies are installed.
- L72 enhanced elevator seed data is available.
- Developer auth is enabled for local operator sessions.
- AI service is not required.

## Environment

Backend:

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

Frontend:

```sh
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
VITE_BUILDING_ID=L72
VITE_OPERATOR_ROLE=operator
VITE_WS_RECONNECT_MS=1000
```

## Validation Flow

1. Start Ditto and supporting local infrastructure.
2. Start backend with `cd backend && npm run dev`.
3. Seed enhanced L72 elevator Things.
4. Start frontend with `cd frontend && npm run dev`.
5. Confirm list and detail views show enhanced state fields.
6. Confirm the 3D scene places cabins in configured shafts with door, load, movement, and health cues.
7. Update one field in Ditto using a partial merge event.
8. Confirm backend hydrates or merges the partial update and browser receives `elevator.state.changed`.
9. Replay movement and door percentage changes.
10. Confirm scene interpolation is smooth and detail/list remain consistent.
11. Open playback for one elevator and scrub a recent time range.
12. Return to live mode and confirm live state is preserved.
13. Submit an allowed simulated command and a disallowed command.
14. Confirm command lifecycle, rejection reason, and audit/status events.
15. Interrupt Ditto live delivery.
16. Confirm stale/degraded state appears while last accepted detailed state remains visible.

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

Manual validation remains required for live Ditto events, 3D movement, playback, and command workflows.
