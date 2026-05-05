# Smart Building Operations Dashboard

Implementation scaffold for the Keangnam Landmark 72 smart building digital twin platform.

## Workspaces

- `frontend/`: operator dashboard and stateful UI projections
- `backend/`: API gateway, realtime mediation, and operational services
- `ai-service/`: predictive maintenance service
- `infra/`: local and deployment infrastructure

## Ditto Reference

- Raw Ditto HTTP API contract: [docs/ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml)
- Project-specific integration notes: [docs/ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md)
- Backend Swagger UI: `http://localhost:3000/docs`

## Phase 7 Ditto Realtime Synchronization

- Active phase-7 feature: [specs/007-ditto-realtime-sync/spec.md](specs/007-ditto-realtime-sync/spec.md)
- Active phase-7 implementation plan: [specs/007-ditto-realtime-sync/plan.md](specs/007-ditto-realtime-sync/plan.md)
- Active phase-7 task list: [specs/007-ditto-realtime-sync/tasks.md](specs/007-ditto-realtime-sync/tasks.md)

## Phase 7 Validation

Run the realtime synchronization checks by workspace:

- Backend: `cd backend && npm run validate:phase7`
- Frontend: `cd frontend && npm run validate:phase7`

This phase validates live Ditto-to-dashboard synchronization on top of the existing Ditto-backed backend, including accepted live propagation, rejected-event handling, reconnect or resync behavior, and degraded-state visibility without starting or depending on the AI service.

The frontend runtime remains backend-mediated in this phase: operator views consume `/elevators` bootstrap and backend-managed realtime state rather than calling Ditto directly.
