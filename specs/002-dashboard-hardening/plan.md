# Implementation Plan: Dashboard Hardening and Operational Readiness

**Branch**: `[002-dashboard-hardening]` | **Date**: 2026-05-04 | **Spec**: [spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/spec.md)
**Input**: Feature specification from `/specs/002-dashboard-hardening/spec.md`

## Summary

Complete the remaining production-readiness work for the Smart Building Operations Dashboard by adding true Twin bootstrap and live synchronization paths, aligning backend behavior with the published contracts, upgrading the dashboard UI to an operator-grade experience, and validating the AI warning flow and local quickstart end-to-end.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend; Python 3.12 for AI services  
**Primary Dependencies**: React, Zustand, Tailwind CSS, React Three Fiber, Express, WebSocket transport, Eclipse Ditto HTTP and WebSocket APIs, FastAPI, Vitest, Playwright  
**Storage**: Ditto for live digital twin state; MongoDB for metadata and UI configuration; TimescaleDB for historical telemetry and alert history; Redis for transient realtime support; in-memory test doubles for unit and integration layers  
**Testing**: Vitest and React Testing Library, Playwright, backend integration and contract tests, WebSocket realtime tests, pytest for AI services, documented quickstart validation  
**Target Platform**: Linux containers and local developer environments running frontend, backend, AI service, and supporting infrastructure  
**Project Type**: Distributed web platform with frontend, backend, analytics service, and infrastructure manifests  
**Performance Goals**: Bootstrap current building elevator state in under 5 seconds locally; propagate accepted live state changes to UI projections within 500 ms for steady-state validation; maintain usable degraded-state behavior during Twin or analytics failure  
**Constraints**: No frontend-to-Twin direct access; no polling fallback for live monitoring; backend remains the control plane for normalization and authorization; operator UI must remain usable under empty, stale, and partial data states  
**Scale/Scope**: One building operations dashboard with elevator monitoring, alerts, commands, 3D view, history, and AI warnings, focused on production-hardening and completion rather than new domain expansion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Twin authority preserved: Pass. Bootstrap and live synchronization both source current operational state from the Twin and only expose backend-normalized data downstream.
- Event-driven delivery preserved: Pass. Realtime behavior remains backend-managed and push-based, with explicit degraded handling rather than polling.
- Schema governance preserved: Pass. Work includes contract alignment, normalized state mapping, and versioned event handling across bootstrap and live flows.
- Layered architecture preserved: Pass. Frontend remains backend-mediated for all Twin and analytics access.
- Operational gates preserved: Pass. Plan includes observability, resilience, UI degraded-state validation, and AI verification work.
- Post-design re-check: Pass. Design artifacts preserve backend mediation, explicit failure handling, and versioned contracts across the new phase.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-hardening/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   ├── realtime-events.md
│   └── twin-bootstrap-mapping.md
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
│   │   ├── alerts/
│   │   ├── analytics/
│   │   └── realtime/
│   └── observability/
└── tests/
    ├── contract/
    └── integration/

ai-service/
├── app/
│   ├── api/
│   ├── pipelines/
│   └── services/
└── tests/

docs/
└── *.md
```

**Structure Decision**: Retain the existing multi-service layout and focus changes inside the current frontend, backend, AI service, and docs roots. This keeps the hardening phase aligned with the original architecture and avoids introducing new services for work that belongs in the current control plane and dashboard.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Additional Twin bootstrap mapping contract | The hardening phase needs a separate document for mapping raw Twin payloads to normalized elevator state | Folding the mapping into generic notes would blur the contract boundary between Twin payloads and app state |
| Dedicated UI polish story | Operator usability is a feature-completeness requirement, not cosmetic cleanup | Treating UI completion as generic polish would under-specify empty, degraded, and cross-panel state behavior |
