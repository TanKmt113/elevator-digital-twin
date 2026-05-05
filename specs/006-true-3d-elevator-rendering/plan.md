# Implementation Plan: True 3D Elevator Rendering

**Branch**: `[003-digital-twin-3d]` | **Date**: 2026-05-05 | **Spec**: [spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/006-true-3d-elevator-rendering/spec.md)
**Input**: Feature specification from `/specs/006-true-3d-elevator-rendering/spec.md`

## Summary

Replace the current card-based spatial projection with a true 3D elevator scene that renders shafts, floors, and cabins in real space while preserving the backend-mediated Ditto runtime, shared dashboard selection contracts, and degraded-state semantics from phase 005. The implementation will introduce a dedicated 3D rendering adapter, camera focus controls, live cabin motion updates, and local performance safeguards without changing Twin authority or frontend auth boundaries.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for frontend and backend  
**Primary Dependencies**: React 19, Zustand, Vite, Tailwind CSS, `three`, `@react-three/fiber`, `@react-three/drei`, existing backend-mediated bootstrap and realtime contracts  
**Storage**: N/A for new persistence; consumes existing backend-normalized in-memory elevator state and Ditto-backed runtime data  
**Testing**: Vitest integration and scene-state tests, frontend component rendering tests, backend contract compatibility tests, local manual quickstart validation  
**Target Platform**: Linux local development environment and desktop/laptop web browsers with WebGL support  
**Project Type**: Distributed web application with backend-mediated realtime state and a frontend true-3D operations surface  
**Performance Goals**: Initial 3D scene ready within 5 seconds of dashboard load; accepted live updates reflected in scene within 500 ms; overview and focus interactions remain responsive under representative local load; no frozen render interval longer than 1 second during validation  
**Constraints**: No direct frontend access to Ditto; no AI-service dependency; 3D renderer must reuse governed scene/runtime contracts from phase 005; camera transitions must remain predictable; asset loading must stay local and lightweight for developer validation  
**Scale/Scope**: One representative validation building (`L72`) with a small elevator fleet, true 3D cabin and shaft rendering, operator-focused inspection workflows, and local browser validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Digital Twin authority preserved: Pass. The 3D renderer remains a projection of backend-normalized state and does not add direct Twin access from the browser.
- Event-driven delivery preserved: Pass. Live 3D updates continue to flow through backend-mediated bootstrap and websocket synchronization, including stale and degraded-state handling.
- Governed schemas and state preserved: Pass. The feature reuses the existing dashboard scene/runtime contracts and extends them with render-specific geometry and camera metadata rather than inventing a parallel data source.
- Layered architecture preserved: Pass. The work is isolated to frontend 3D modules, shared frontend stores, and scene-adjacent tests; backend remains the control plane and auth boundary.
- Operational gates preserved: Pass. The plan includes local render responsiveness, camera focus continuity, explicit degraded states, and layer-appropriate testing and observability.
- Post-design re-check: Pass. Phase 1 artifacts keep backend mediation, reuse existing auth scope, and define render/runtime contracts without violating constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/006-true-3d-elevator-rendering/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── camera-focus.md
│   └── scene-runtime.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── modules/elevators/
│   └── modules/realtime/
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
│   │   ├── render/
│   │   └── services/
│   ├── services/realtime/
│   └── store/
└── tests/
    ├── integration/
    └── e2e/

docs/
└── *.md
```

**Structure Decision**: Reuse the existing backend and dashboard state boundaries, and add a dedicated `frontend/src/modules/twin3d/render/` slice for true 3D renderer components such as the canvas scene, cabin mesh adapter, and camera controller. Shared scene/runtime logic stays in existing stores and services so the render layer remains an adapter, not a second business state model.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
