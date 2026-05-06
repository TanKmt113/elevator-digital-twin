# Implementation Plan: Enhanced Elevator Digital Twin

**Branch**: `[008-enhanced-elevator-twin]` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-enhanced-elevator-twin/spec.md`

## Summary

Expand the existing Ditto-backed elevator Digital Twin from basic floor/status tracking into a detailed operator-grade Twin that carries continuous position, machine, telemetry, fault, call queue, playback, command, and scene-projection state. The implementation keeps Ditto behind the backend, hydrates partial Twin updates before publication, extends normalized contracts, and drives all dashboard and 3D surfaces from the same accepted state.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend  
**Primary Dependencies**: Express, `ws`, React 19, Zustand, Vite, Three.js / React Three Fiber, existing Ditto HTTP/WebSocket integration points  
**Storage**: Existing in-memory backend materialized state for MVP, existing history repositories for bounded playback, Ditto as authoritative live source  
**Testing**: Vitest backend contract/integration tests, frontend integration tests, existing Playwright/e2e validation where available, local quickstart replay validation  
**Target Platform**: Linux local developer environment and desktop/laptop browsers for operations dashboard  
**Project Type**: Distributed web application with backend-mediated realtime delivery and 3D frontend projection  
**Performance Goals**: Accepted enhanced live updates visible within 500 ms; stale/degraded feedback within 2 seconds; 3D scene remains responsive under representative L72 replay; playback loads a 5-minute local window within 2 seconds  
**Constraints**: No frontend direct Ditto access; no polling substitute for live monitoring; command flows require backend authorization and audit; AI service remains optional; partial Ditto events must hydrate or preserve prior accepted state  
**Scale/Scope**: Representative local building scope `L72`, small elevator fleet, multiple dashboard sessions, replayable full and partial Twin events, bounded recent history, simulated or policy-gated commands

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Digital Twin authority preserved: Pass. Ditto remains the authoritative source and the backend remains the only mediation layer for frontend state.
- Event-driven delivery preserved: Pass. Live behavior uses backend-managed Ditto consumption and WebSocket fan-out with bounded reconnect/resync behavior.
- Governed schemas and data classes preserved: Pass. The plan defines versioned state, telemetry, config, alarm, history, and command contracts.
- Layered architecture preserved: Pass. Frontend consumes backend REST/realtime contracts only; auth, scope, command policy, and audit stay server-side.
- Operational gates preserved: Pass. Observability, rejection counters, hydration diagnostics, scene readiness, playback gaps, and command lifecycle testing are included.
- Post-design re-check: Pass. Design artifacts keep backend mediation, no direct frontend Ditto access, explicit degraded states, and layer-appropriate validation.

## Project Structure

### Documentation (this feature)

```text
specs/008-enhanced-elevator-twin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── enhanced-elevator-state.md
│   ├── realtime-events.md
│   ├── scene-projection.md
│   ├── playback.md
│   └── command-lifecycle.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/routes/
│   ├── contracts/
│   ├── integrations/ditto/
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
    ├── e2e/
    └── integration/

infra/
└── ditto/
```

**Structure Decision**: Reuse the existing backend/frontend/infra boundaries. Backend owns enhanced Twin contracts, Ditto hydration, policy, history, and realtime publication. Frontend owns projection, rendering, selection, playback controls, and operator-facing state surfaces.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
