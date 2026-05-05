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

## Phase 5 3D Operations Runtime

- Active phase-5 feature: [specs/005-3d-operations-runtime/spec.md](specs/005-3d-operations-runtime/spec.md)
- Active phase-5 implementation plan: [specs/005-3d-operations-runtime/plan.md](specs/005-3d-operations-runtime/plan.md)
- Active phase-5 task list: [specs/005-3d-operations-runtime/tasks.md](specs/005-3d-operations-runtime/tasks.md)

## Phase 5 Validation

Run the 3D-operations runtime checks by workspace:

- Backend: `cd backend && npm run validate:phase5`
- Frontend: `cd frontend && npm run validate:phase5`

This phase validates the operator-facing 3D runtime on top of the Ditto-backed backend, including readable scene projections, synchronized selection, degraded-state visibility, and responsive scene behavior without starting or depending on the AI service.

The frontend 3D runtime remains backend-mediated in this phase: operator views consume `/elevators` bootstrap and shared realtime state rather than calling Ditto directly.
