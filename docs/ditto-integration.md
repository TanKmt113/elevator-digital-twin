# Eclipse Ditto Integration Notes

This project uses [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml) as the local source of truth for Ditto's HTTP API surface.

## Relevant Ditto Endpoints

- `GET /api/2/things`
  Used to bootstrap visible elevator twins or request a filtered set of `thingId`s.
- `GET /api/2/things/{thingId}`
  Used to hydrate a single elevator twin with selected fields.
- `GET /api/2/things?ids=...&fields=...`
  Preferred dashboard bootstrap pattern to avoid fetching the full Thing document.

## Suggested Field Projection

For elevator monitoring, prefer requesting only the fields needed by the normalized contract:

```text
thingId,attributes,features
```

Expected mapping into the app contract:

- `thingId` -> `elevatorId`
- `attributes.buildingId` -> `buildingId`
- `features.elevator.properties.currentFloor` -> `currentFloor`
- `features.elevator.properties.targetFloor` -> `targetFloor`
- `features.elevator.properties.direction` -> `direction`
- `features.elevator.properties.doorState` -> `doorState`
- `features.elevator.properties.loadPercentage` -> `loadPercentage`
- `features.elevator.properties.status` -> `status`
- `features.elevator.properties.healthState` -> `healthState`

## Backend Configuration

The backend Ditto client reads:

- `DITTO_HTTP_URL`
- `DITTO_WS_URL`
- `DITTO_USERNAME`
- `DITTO_PASSWORD`
- `DITTO_BEARER_TOKEN`

Authentication precedence:

1. Bearer token when `DITTO_BEARER_TOKEN` is set
2. Basic auth when `DITTO_USERNAME` and `DITTO_PASSWORD` are set
3. No auth header otherwise

## Current Backend Client Surface

`backend/src/integrations/ditto/ditto-client.ts` now supports:

- `listThings({ ids, fields, timeout })`
- `getThing(thingId, { fields, timeout, condition })`
- `getRealtimeUrl()`
- in-memory `subscribe()` / `emit()` hooks for normalized event fan-out

This is enough to wire the next implementation steps:

1. bootstrap elevator state from Ditto HTTP before realtime updates start
2. map Ditto Thing payloads into `ElevatorTwin`
3. connect Ditto WebSocket events to `event-normalizer.ts`
4. fall back to point lookup for selected elevator detail views

## Phase 2 Validation Focus

- Startup readiness must distinguish `loading`, `ready`, `empty`, and `degraded` dashboard states.
- Twin bootstrap failure must be observable through backend health, logs, or metrics.
- Live synchronization must preserve last accepted state when delivery is delayed, duplicated, or temporarily unavailable.
