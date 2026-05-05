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

## Phase 6 True 3D Elevator Rendering

- Active phase-6 feature: [specs/006-true-3d-elevator-rendering/spec.md](specs/006-true-3d-elevator-rendering/spec.md)
- Active phase-6 implementation plan: [specs/006-true-3d-elevator-rendering/plan.md](specs/006-true-3d-elevator-rendering/plan.md)
- Active phase-6 task list: [specs/006-true-3d-elevator-rendering/tasks.md](specs/006-true-3d-elevator-rendering/tasks.md)

## Phase 6 Validation

Run the true-3D runtime checks by workspace:

- Backend: `cd backend && npm run validate:phase6`
- Frontend: `cd frontend && npm run validate:phase6`

This phase validates the operator-facing true 3D runtime on top of the Ditto-backed backend, including shaft and cabin rendering, synchronized camera focus, degraded-state visibility, and responsive scene behavior without starting or depending on the AI service.

The frontend 3D runtime remains backend-mediated in this phase: operator views consume `/elevators` bootstrap and shared realtime state rather than calling Ditto directly.
