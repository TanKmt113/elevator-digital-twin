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

## Phase 3 Digital Twin and 3D

- Active phase-3 feature: [specs/003-digital-twin-3d/spec.md](specs/003-digital-twin-3d/spec.md)
- Active phase-3 implementation plan: [specs/003-digital-twin-3d/plan.md](specs/003-digital-twin-3d/plan.md)
- Active phase-3 task list: [specs/003-digital-twin-3d/tasks.md](specs/003-digital-twin-3d/tasks.md)

## Phase 3 Validation

Run the Digital Twin and 3D checks by workspace:

- Backend: `cd backend && npm run validate:phase3`
- Frontend: `cd frontend && npm run validate:phase3`

This phase validates Twin bootstrap, backend-mediated live synchronization, degraded readiness, and list/detail/3D selection without starting or depending on the AI service.
