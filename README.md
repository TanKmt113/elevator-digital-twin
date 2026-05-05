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

## Phase 4 Ditto End-to-End Runtime

- Active phase-4 feature: [specs/004-ditto-end-to-end/spec.md](specs/004-ditto-end-to-end/spec.md)
- Active phase-4 implementation plan: [specs/004-ditto-end-to-end/plan.md](specs/004-ditto-end-to-end/plan.md)
- Active phase-4 task list: [specs/004-ditto-end-to-end/tasks.md](specs/004-ditto-end-to-end/tasks.md)

## Phase 4 Validation

Run the Ditto-backed runtime checks by workspace:

- Backend: `cd backend && npm run validate:phase4`
- Frontend: `cd frontend && npm run validate:phase4`

This phase validates Ditto bootstrap, backend-mediated live synchronization, degraded readiness, scoped operator access, and list/detail/3D consistency without starting or depending on the AI service.
