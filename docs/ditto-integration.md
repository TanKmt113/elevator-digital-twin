# Eclipse Ditto Integration Notes

This project uses [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml) as the local source of truth for Ditto's HTTP API surface.

## Relevant Ditto Endpoints

- `GET /api/2/things`
  Used to bootstrap visible elevator twins or request a filtered set of `thingId`s.
- `GET /api/2/things/{thingId}`
  Used to hydrate a single elevator twin with selected fields.
- `GET /api/2/things?ids=...&fields=...`
  Preferred dashboard bootstrap pattern to avoid fetching the full Thing document.
- `GET /api/2/things/{thingId}?fields=thingId,attributes,features`
  Used by live recovery or minimal live projection when a Twin event only identifies the changed thing.

## Suggested Field Projection

For elevator monitoring, prefer requesting only the fields needed by the normalized contract:

```text
thingId,attributes,features
```

Expected mapping into the app contract:

- `thingId` -> `elevatorId`
- `attributes.buildingId` -> `buildingId`
- `attributes.shaftId` -> 3D shaft binding when present
- `features.elevator.properties.currentFloor` -> `currentFloor`
- `features.elevator.properties.targetFloor` -> `targetFloor`
- `features.elevator.properties.positionMeters` -> `positionMeters`
- `features.elevator.properties.floorProgress` -> `floorProgress`
- `features.elevator.properties.speedMps` -> `speedMps`
- `features.elevator.properties.accelerationMps2` -> `accelerationMps2`
- `features.elevator.properties.direction` -> `direction`
- `features.elevator.properties.doorState` -> `doorState`
- `features.elevator.properties.doorOpenPercent` -> `doorOpenPercent`
- `features.elevator.properties.doorObstruction` -> `doorObstruction`
- `features.elevator.properties.doorCycleCount` -> `doorCycleCount`
- `features.elevator.properties.loadKg` -> `loadKg`
- `features.elevator.properties.ratedLoadKg` -> `ratedLoadKg`
- `features.elevator.properties.loadPercentage` -> `loadPercentage`
- `features.elevator.properties.status` -> `status`
- `features.elevator.properties.mode` -> `mode`
- `features.elevator.properties.brakeState` -> `brakeState`
- `features.elevator.properties.motorState` -> `motorState`
- `features.elevator.properties.controllerState` -> `controllerState`
- `features.elevator.properties.motorTempC` -> `motorTempC`
- `features.elevator.properties.controllerTempC` -> `controllerTempC`
- `features.elevator.properties.powerKw` -> `powerKw`
- `features.elevator.properties.vibrationLevel` -> `vibrationLevel`
- `features.elevator.properties.healthState` -> `healthState`
- `features.elevator.properties.faultCode` -> `faultCode`
- `features.elevator.properties.faultSeverity` -> `faultSeverity`
- `features.elevator.properties.lastFaultAt` -> `lastFaultAt`
- `features.elevator.properties.activeCalls` -> `activeCalls`
- `features.elevator.properties.stopQueue` -> `stopQueue`
- `features.elevator.properties.etaSeconds` -> `etaSeconds`

## Enhanced Digital Twin Contract

Phase 8 expands the normalized elevator contract from basic floor/status state to an operator-grade Twin. The authoritative source is still Ditto, but frontend surfaces continue to consume only backend-normalized REST and realtime events. Partial Ditto merge events must be hydrated or merged by the backend before publication so browser clients receive a complete, scoped elevator projection.

Spec Kit references:

- [Enhanced elevator state contract](../specs/008-enhanced-elevator-twin/contracts/enhanced-elevator-state.md)
- [Enhanced realtime events](../specs/008-enhanced-elevator-twin/contracts/realtime-events.md)
- [Scene projection contract](../specs/008-enhanced-elevator-twin/contracts/scene-projection.md)

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
- `createAuthorizationHeaders()`
- in-memory `subscribe()` / `emit()` hooks for normalized event fan-out

This client surface now supports the implemented phase-7 realtime flow:

1. bootstrap elevator state from Ditto HTTP before realtime updates start
2. project live Twin changes into governed backend contracts
3. connect Ditto WebSocket events to backend normalization and rejection handling
4. keep frontend detail, summary, and 3D views synchronized through backend REST and websocket delivery

## Local Realtime Replay

- Use `POST /dev/ditto/replay` with a full Thing body to simulate a live Twin change through backend-managed delivery.
- Use `infra/ditto/replay-events.json` as the local catalog of replayable fixtures.
- Use `node --experimental-strip-types infra/ditto/replay-ditto-event.ts <eventId>` to replay a named local fixture against `API_BASE_URL`.

## Phase 7 Validation Focus

- Startup readiness must distinguish `loading`, `ready`, `empty`, and `degraded` dashboard states.
- Twin bootstrap failure must be observable through backend health, logs, or metrics.
- Live synchronization must preserve last accepted state when delivery is delayed, duplicated, or temporarily unavailable.
- Live rejection counters should identify duplicate, out-of-order, out-of-scope, and malformed changes separately.
- Realtime recovery should transition through explicit `stale` or `resyncing` state before returning to `live`.
- AI service availability is not part of this validation path and must not mask Twin synchronization readiness.
