# Ditto L72 Seed Data

This directory contains the local Ditto inputs used by the Enhanced Elevator Digital Twin quickstart.

- `local-l72-elevators.json` seeds the representative L72 elevator Things.
- `replay-events.json` provides replayable Twin updates for realtime and playback validation.
- `replay-ditto-event.ts` replays Ditto-style events through the local integration path.
- `simulate-elevator-sensors.ts` continuously simulates L72 elevator sensor telemetry through the same replay path.

Use these fixtures when validating feature 008 bootstrap, partial update hydration, 3D projection, playback, and stale/degraded behavior.

## Continuous simulator

Start backend and frontend, then run:

```sh
node --experimental-strip-types infra/ditto/simulate-elevator-sensors.ts
```

Optional environment variables:

- `API_BASE_URL` defaults to `http://localhost:3000`
- `SENSOR_INTERVAL_MS` defaults to `1200`
- `SENSOR_MIN_FLOOR` defaults to `1`
- `SENSOR_MAX_FLOOR` defaults to `32`
- `SENSOR_SEED_FIRST=false` skips `POST /dev/ditto/seed`
- `SENSOR_RISK_SCENARIOS=false` disables scheduled risk/fault scenarios
- `SENSOR_RISK_EVERY_TICKS` defaults to `8`; lower it to trigger risk scenarios faster

## Risk Engine scenarios

By default the continuous simulator injects scheduled scenarios so `/analytics` can receive realistic predictive warnings:

- `door_blocked`: blocked door with critical health and `DOOR-BLOCKED`
- `thermal`: motor/controller temperatures above Risk Engine thresholds
- `vibration`: vibration level above critical threshold
- `overload`: repeated `loadPercentage >= 110`
- `active_fault`: critical fault code from the brake/controller path

For faster demo feedback:

```sh
SENSOR_INTERVAL_MS=700 SENSOR_RISK_EVERY_TICKS=3 node --experimental-strip-types infra/ditto/simulate-elevator-sensors.ts
```

For normal-only motion simulation:

```sh
SENSOR_RISK_SCENARIOS=false node --experimental-strip-types infra/ditto/simulate-elevator-sensors.ts
```
