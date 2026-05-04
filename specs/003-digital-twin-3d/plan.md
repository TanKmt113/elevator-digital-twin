# Implementation Plan: Digital Twin and 3D Operations View

**Branch**: `[003-digital-twin-3d]` | **Date**: 2026-05-04 | **Spec**: [spec.md](/home/tandev/AoeVina/elevator-digital-twin/specs/003-digital-twin-3d/spec.md)
**Input**: Feature specification from `/specs/003-digital-twin-3d/spec.md`

## Summary

Deliver the Digital Twin and 3D operator experience before continuing AI work. This phase focuses on making elevator state authoritative from the Twin, keeping live updates synchronized through the backend, and rendering a dependable 3D view that stays consistent with the list and detail panels.

AI predictive maintenance is explicitly out of scope for this phase.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend  
**Primary Dependencies**: React, Zustand, Tailwind CSS, React Three Fiber, Express, WebSocket transport, Eclipse Ditto HTTP and WebSocket APIs, Vitest, Playwright  
**Storage**: Ditto for live Digital Twin state; existing in-memory repositories and test doubles for local validation  
**Testing**: Vitest, React Testing Library-style integration tests, backend contract and integration tests, realtime event tests, quickstart validation  
**Target Platform**: Linux containers and local developer environments running frontend, backend, and Twin-compatible infrastructure  
**Project Type**: Distributed web platform with backend-mediated Digital Twin access and frontend 3D dashboard projection  
**Performance Goals**: Bootstrap current building elevator state in under 5 seconds locally; propagate accepted live state changes to dashboard and 3D projections within 500 ms during steady-state validation  
**Constraints**: No frontend-to-Twin direct access; no AI-service dependency; no polling fallback for live monitoring; backend remains the normalization and authorization control plane  
**Scale/Scope**: One active building operations dashboard with elevator monitoring and 3D inspection

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Twin authority preserved: Pass. Current and live elevator state are sourced from the Digital Twin and normalized by the backend.
- Event-driven delivery preserved: Pass. Live behavior remains backend-managed and push-based with stale and degraded signaling.
- Schema governance preserved: Pass. Work includes explicit Twin mapping and normalized event contracts.
- Layered architecture preserved: Pass. Frontend consumes backend contracts only.
- Operational gates preserved: Pass. Plan includes bootstrap, live sync, degraded behavior, observability, and 3D validation.
- Post-design re-check: Pass. Design artifacts preserve backend mediation and exclude AI dependencies from this phase.

## Project Structure

### Documentation (this feature)

```text
specs/003-digital-twin-3d/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   ├── realtime-events.md
│   └── twin-3d-mapping.md
├── checklists/
│   └── requirements.md
├── spec.md
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
│   │   └── twin3d/
│   ├── services/
│   └── store/
└── tests/
    ├── integration/
    └── e2e/

backend/
├── src/
│   ├── api/
│   ├── config/
│   ├── integrations/
│   │   └── ditto/
│   ├── modules/
│   │   ├── elevators/
│   │   └── realtime/
│   └── observability/
└── tests/
    ├── contract/
    └── integration/

docs/
└── *.md
```

**Structure Decision**: Reuse the current backend and frontend boundaries. The AI service remains present in the repo but is not required for this feature's validation or done definition.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dedicated 3D mapping contract | The 3D scene needs a clear projection from normalized elevator state to visual state | Leaving this implicit risks divergent list/detail/3D behavior |
| Separate feature from dashboard hardening | The user wants Digital Twin and 3D work first without AI | Continuing in the mixed phase would keep AI tasks coupled to the next delivery slice |
