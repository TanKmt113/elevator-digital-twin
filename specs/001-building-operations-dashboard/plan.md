# Implementation Plan: Smart Building Operations Dashboard

**Branch**: `001-building-operations-dashboard` | **Date**: 2026-05-04 | **Spec**: [spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/001-building-operations-dashboard/spec.md)
**Input**: Feature specification from `/specs/001-building-operations-dashboard/spec.md`

## Summary

Build an event-driven smart building operations platform for Keangnam Landmark
72 that uses Eclipse Ditto as the operational source of truth, exposes
backend-mediated REST and WebSocket interfaces, renders realtime elevator and
alert state in a React dashboard with a 3D twin view, stores historical data in
dedicated persistence layers, and surfaces AI-driven risk warnings from a
separate analytics service.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend; Python 3.12 for AI services  
**Primary Dependencies**: React, Zustand, React Three Fiber, Tailwind CSS, Express, WebSocket transport, OpenAPI, Eclipse Ditto integration clients, Redis, MongoDB, TimescaleDB, FastAPI  
**Storage**: Ditto for live digital twin state; MongoDB for metadata and UI configuration; TimescaleDB for historical telemetry and alert history; Redis for cache and transient session or subscription acceleration  
**Testing**: Vitest and React Testing Library, Playwright, Supertest, WebSocket integration tests, MQTT simulation tests, pytest for AI services, k6 for load validation  
**Target Platform**: Linux containers for frontend, API gateway, AI service, and supporting infrastructure  
**Project Type**: Distributed web platform with frontend, backend, analytics service, and infrastructure manifests  
**Performance Goals**: Live state latency under 500 ms from backend receipt to client update for steady-state traffic; support 1000+ devices and stable concurrent operator sessions  
**Constraints**: No frontend-to-Ditto direct access; no polling for live state; all device commands remain supervisory only; services must degrade gracefully during Ditto, network, or downstream failures  
**Scale/Scope**: Initial implementation targets elevator operations for one landmark building with extensible patterns for additional domains such as HVAC, energy, and security

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Twin authority preserved: Pass. All live operational state and AI inputs flow
  through Ditto or data derived from Ditto events; no direct client or AI access
  to devices is planned.
- Event-driven delivery preserved: Pass. Realtime transport is backend-managed
  WebSocket with Ditto and device ingestion over event streams; polling is
  excluded from scope.
- Schema governance preserved: Pass. Elevator twins, commands, alerts, and
  telemetry are versioned contracts with explicit `realtime`, `telemetry`,
  `config`, and `alarm` data classifications.
- Layered architecture preserved: Pass. Frontend talks only to backend APIs and
  backend-managed realtime channels; backend mediates auth, policy, and event
  normalization.
- Operational gates preserved: Pass. Plan includes structured logging, metrics,
  tracing, bounded retries, reconnect logic, role-based authorization, and
  layer-specific testing.
- Post-design re-check: Pass. Phase 1 artifacts retain Twin-first authority,
  backend command mediation, versioned contracts, and graceful degradation.

## Project Structure

### Documentation (this feature)

```text
specs/001-building-operations-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   └── realtime-events.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   ├── modules/
│   │   ├── elevator/
│   │   ├── alerts/
│   │   ├── twin3d/
│   │   └── analytics/
│   ├── store/
│   ├── services/
│   └── assets/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/

backend/
├── src/
│   ├── api/
│   ├── modules/
│   │   ├── auth/
│   │   ├── elevators/
│   │   ├── alerts/
│   │   ├── analytics/
│   │   └── realtime/
│   ├── integrations/
│   │   ├── ditto/
│   │   ├── mqtt/
│   │   ├── redis/
│   │   └── persistence/
│   ├── contracts/
│   └── observability/
└── tests/
    ├── contract/
    ├── integration/
    └── performance/

ai-service/
├── app/
│   ├── api/
│   ├── models/
│   ├── pipelines/
│   └── services/
└── tests/

infra/
├── docker/
├── k8s/
└── observability/
```

**Structure Decision**: Use a multi-service web platform layout with separate
`frontend/`, `backend/`, `ai-service/`, and `infra/` roots. This matches the
constitution’s layered architecture, keeps realtime state management isolated in
the frontend store, and preserves clean service boundaries for future scaling.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate AI service | Predictive maintenance lifecycle differs from operational API runtime | Folding AI into the gateway would couple model dependencies, release cadence, and scaling behavior to the control plane |
| Polyglot persistence | Realtime twin state, historical telemetry, and metadata have different access patterns | A single database would either weaken time-series performance or overload the operational model with mismatched storage concerns |
