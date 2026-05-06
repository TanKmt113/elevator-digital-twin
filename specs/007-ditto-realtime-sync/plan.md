# Implementation Plan: Ditto Realtime Synchronization

**Branch**: `[007-ditto-realtime-sync]` | **Date**: 2026-05-05 | **Spec**: [spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/007-ditto-realtime-sync/spec.md)
**Input**: Feature specification from `/specs/007-ditto-realtime-sync/spec.md`

## Summary

Bridge live Ditto elevator changes into the existing dashboard runtime so accepted Twin updates propagate automatically from Ditto through the backend to all authorized frontend sessions, with rejection handling, reconnect/resync semantics, and explicit stale or degraded operator feedback.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS for backend and frontend  
**Primary Dependencies**: Express, `ws`, React 19, Zustand, Vite, existing Ditto HTTP/WebSocket integration points  
**Storage**: Existing in-memory backend materialized elevator state backed by Ditto as the authoritative source of live changes  
**Testing**: Vitest backend integration and contract tests, frontend integration tests, local quickstart validation  
**Target Platform**: Linux local developer environment and desktop browsers for the operations dashboard  
**Project Type**: Distributed web application with backend-mediated realtime delivery  
**Performance Goals**: Accepted in-scope Twin changes visible in dashboard surfaces within 500 ms; stale or degraded feedback visible within 2 seconds of delivery interruption; resync restores current accepted state without full page reload  
**Constraints**: No frontend direct Ditto access; no polling substitute for live monitoring; retries must be bounded; operator scope must remain building-scoped; AI service remains out of scope  
**Scale/Scope**: One representative local building scope (`L72`), a small elevator fleet, multiple concurrent dashboard sessions, and replayable accepted and rejected live events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Digital Twin authority preserved: Pass. Ditto remains the only source of live elevator changes; frontend continues to consume only backend-normalized state.
- Event-driven delivery preserved: Pass. The plan uses backend-managed push delivery and explicit reconnect or resync semantics rather than polling.
- Governed schemas and state preserved: Pass. Live changes are normalized into the existing versioned elevator envelope and synchronization model before publication.
- Layered architecture preserved: Pass. Ditto stays behind the backend control plane; auth and scope enforcement remain server-side.
- Operational gates preserved: Pass. Health, rejection counters, session tracking, reconnect, degraded behavior, and layer-appropriate tests are included.
- Post-design re-check: Pass. The generated artifacts keep backend mediation, versioned event envelopes, and bounded reconnect behavior without introducing constitution exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/007-ditto-realtime-sync/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── realtime-events.md
│   └── resync-sequence.md
└── tasks.md
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
│   ├── modules/twin3d/
│   ├── services/api/
│   ├── services/realtime/
│   └── store/
└── tests/
    └── integration/

infra/
└── ditto/
```

**Structure Decision**: Reuse the current backend and frontend boundaries. The main implementation slices are the Ditto live consumer, backend realtime session and publisher layer, frontend realtime client and store application layer, plus spec-local contracts and validation docs.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
