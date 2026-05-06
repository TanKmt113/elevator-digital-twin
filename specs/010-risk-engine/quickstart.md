# Quickstart: Realtime Risk Engine

## Goal

Validate that live simulated elevator sensor changes generate predictive-maintenance warnings in the analytics view without using `ai-service`.

## Prerequisites

- Local infrastructure and Ditto are running.
- Backend is running on `http://localhost:3000`.
- Frontend is running on `http://localhost:5173`.
- You can login locally through the dashboard login page.

## Start the Local Stack

Backend:

```sh
cd backend
npm run dev
```

Frontend:

```sh
cd frontend
npm run dev
```

Seed and simulate elevator sensors:

```sh
node --experimental-strip-types infra/ditto/simulate-elevator-sensors.ts
```

Optional faster simulation:

```sh
SENSOR_INTERVAL_MS=700 node --experimental-strip-types infra/ditto/simulate-elevator-sensors.ts
```

## Manual Validation

1. Open `http://localhost:5173/login`.
2. Login with local dev admin.
3. Open `/fleet` and confirm live elevator state changes.
4. Open `/analytics`.
5. Trigger or wait for risk conditions such as blocked door, elevated vibration, high temperature, active fault, or repeated overload.
6. Confirm a predictive warning appears with:
   - elevator id
   - risk level
   - prediction window
   - drivers
   - verification/trace metadata
7. Confirm `/fleet` and `/scene` continue updating even if analytics warning generation fails in a negative test.

## Simulator Scenarios

The local simulator should produce or can be adjusted to produce these rule inputs:

- Door risk: `doorState=blocked` or `doorObstruction=true`
- Fault risk: `faultCode` present or `healthState=critical`
- Thermal risk: `motorTempC >= 80` or `controllerTempC >= 75`
- Vibration risk: `vibrationLevel >= 5`
- Repeated overload: at least two accepted states with `loadPercentage >= 110`

Expected `/analytics` behavior:

- Risk warnings use Vietnamese driver labels in the frontend.
- Repeated equivalent warnings for the same elevator/risk type update the active warning instead of adding duplicate rows.
- If severity increases from `high` to `critical`, the existing active warning updates.
- Realtime event payloads use `eventType=elevator.risk.updated` and `dataClass=alarm`.

## API Validation

Check risk list:

```sh
curl -H "Authorization: Bearer <token>" http://localhost:3000/analytics/risk
```

Check readiness:

```sh
curl -H "Authorization: Bearer <token>" http://localhost:3000/analytics/risk/readiness
```

## Expected Outcomes

- Normal elevator states do not create risk warnings.
- Door blockage, fault, heat, vibration, or repeated overload conditions create warnings.
- Duplicate equivalent warnings do not flood the analytics panel.
- Analytics readiness remains `ready` after valid warnings and `degraded` after warning validation or persistence failure.

## Validation Commands

Backend:

```sh
cd backend
npm run build
npm test
```

Frontend:

```sh
cd frontend
npm run build
npm test
```
