# Implementation Plan: Ditto End-to-End Digital Twin Runtime

**Branch**: `[003-digital-twin-3d]` | **Date**: 2026-05-04 | **Spec**: [spec.md](/home/tandev/AoeVina/elevator-digital-twin/specs/004-ditto-end-to-end/spec.md)  
**Input**: Feature specification from `/specs/004-ditto-end-to-end/spec.md`

## Summary

Make the Digital Twin runtime demonstrable end-to-end when Ditto is available. This phase turns the current bootstrap and UI projection scaffold into a working runtime by adding repeatable Ditto seeding, frontend REST bootstrap, real backend-to-frontend realtime delivery, Ditto live event consumption, scoped authentication wiring, and operational health signals. AI predictive maintenance remains out of scope.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend  
**Primary Dependencies**: Express, ws, jsonwebtoken, React, Zustand, Vite, Tailwind CSS, Eclipse Ditto HTTP API and WebSocket/live event channels, Docker Compose, Vitest  
**Storage**: Eclipse Ditto as live Twin source; existing in-memory repositories for local materialized state; local seeded Ditto dataset for validation  
**Testing**: Vitest backend contract/integration/realtime tests, frontend integration tests, local quickstart validation, websocket flow tests with test doubles  
**Target Platform**: Linux local developer environment and Linux containers  
**Project Type**: Distributed web platform with backend-mediated Digital Twin access and frontend operations dashboard  
**Performance Goals**: Current building elevator state visible within 5 seconds of backend startup and page load; accepted live Twin updates visible across list/detail/summary/3D within 500 ms during local steady-state validation; realtime disconnect state visible within 2 seconds  
**Constraints**: No frontend direct access to Ditto; no AI-service dependency; no polling substitute for live monitoring; backend remains normalization, authorization, and realtime control plane; retries must be bounded  
**Scale/Scope**: One local validation building scope (`L72`) with a representative elevator fleet and replayable live updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Twin authority preserved: Pass. Ditto remains the source for elevator state and seed data exists only to populate Ditto, not bypass it.
- Event-driven delivery preserved: Pass. Live behavior uses Ditto-originated events and backend-managed websocket delivery; REST is only for initial bootstrap and resync.
- Schema governance preserved: Pass. Plan includes versioned realtime, bootstrap, seed, and client event contracts.
- Layered architecture preserved: Pass. Frontend reads backend REST/realtime only; Ditto credentials remain backend/local tooling concerns.
- Operational gates preserved: Pass. Plan includes health, metrics, failure modes, auth scope, retries, and layer tests.
- Post-design re-check: Pass. Generated contracts preserve backend mediation, event envelopes, scoped auth, and degraded behavior.

## Project Structure

### Documentation (this feature)

```text
specs/004-ditto-end-to-end/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── backend-api.yaml
│   ├── realtime-events.md
│   ├── ditto-seed-dataset.md
│   └── ditto-live-events.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── config/
│   ├── integrations/ditto/
│   ├── modules/auth/
│   ├── modules/elevators/
│   ├── modules/realtime/
│   └── observability/
└── tests/
    ├── contract/
    └── integration/

frontend/
├── src/
│   ├── app/
│   ├── modules/elevator/
│   ├── modules/twin3d/
│   ├── services/api/
│   ├── services/realtime/
│   └── store/
└── tests/
    ├── integration/
    └── e2e/

infra/
├── docker/
└── observability/

docs/
└── *.md
```

**Structure Decision**: Reuse the existing backend, frontend, docs, and infra boundaries. Add end-to-end runtime behavior inside the current Ditto, realtime, auth, elevator, and frontend service modules rather than introducing another service.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
