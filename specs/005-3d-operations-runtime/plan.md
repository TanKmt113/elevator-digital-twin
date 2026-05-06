# Implementation Plan: 3D Operations Runtime

**Branch**: `[003-digital-twin-3d]` | **Date**: 2026-05-05 | **Spec**: [spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/005-3d-operations-runtime/spec.md)
**Input**: Feature specification from `/specs/005-3d-operations-runtime/spec.md`

## Summary

Turn the existing Twin scene from a basic visual projection into an operator-usable 3D runtime. This phase focuses on scene readability, selection and focus continuity, live 3D synchronization, degraded-state behavior, and render performance under representative load, while reusing the Ditto-backed backend and dashboard contracts from phase 4.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for frontend and backend  
**Primary Dependencies**: React 19, Zustand, Vite, Tailwind CSS, existing Twin scene components and backend-mediated realtime contracts  
**Storage**: N/A for new persistence; consumes existing backend-normalized in-memory elevator state and Ditto-backed runtime data  
**Testing**: Vitest frontend integration and scene-state tests, backend contract compatibility tests, local manual quickstart validation  
**Target Platform**: Linux local development environment and desktop/laptop web browsers  
**Project Type**: Distributed web application with backend-mediated realtime state and frontend 3D operations view  
**Performance Goals**: Initial 3D scene ready within 5 seconds of dashboard load; accepted live updates reflected in scene within 500 ms; interaction and selection changes remain responsive under representative local building load  
**Constraints**: No direct frontend access to Ditto; no AI-service dependency; 3D must reflect the same normalized elevator state as list and detail views; degraded and stale states must remain explicit  
**Scale/Scope**: One representative validation building (`L72`) with a small fleet of elevators, operator-focused 3D inspection and live monitoring workflows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Digital Twin authority preserved: Pass. The scene remains a projection of backend-normalized Twin state and does not add frontend access to Ditto.
- Event-driven delivery preserved: Pass. Live scene updates continue to flow through backend-mediated realtime contracts and reuse the existing synchronization model.
- Governed schemas and state preserved: Pass. The plan extends scene-level contracts from normalized elevator state rather than inventing a parallel state model outside governed flows.
- Layered architecture preserved: Pass. The work is concentrated in frontend 3D modules and shared UI state, while backend remains the control plane and auth boundary.
- Operational gates preserved: Pass. Plan includes degraded-state semantics, performance checks, synchronized selection behavior, and frontend integration validation.
- Post-design re-check: Pass. Phase 1 artifacts define scene-specific state, contracts, and validation paths without violating Twin authority or backend mediation.

## Project Structure

### Documentation (this feature)

```text
specs/005-3d-operations-runtime/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── scene-state.md
│   └── scene-interactions.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── modules/realtime/
│   └── modules/elevators/
└── tests/
    ├── contract/
    └── integration/

frontend/
├── src/
│   ├── app/
│   ├── modules/elevator/
│   ├── modules/twin3d/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── services/realtime/
│   └── store/
└── tests/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Reuse the existing backend and frontend structure. Concentrate the phase in `frontend/src/modules/twin3d/`, shared dashboard stores, and scene-adjacent integration tests. Backend changes, if any, should be limited to contract compatibility or observability support for scene readiness.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
