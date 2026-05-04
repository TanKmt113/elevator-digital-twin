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

## Phase 2 Hardening

- Active phase-2 feature: [specs/002-dashboard-hardening/spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/spec.md)
- Active phase-2 implementation plan: [specs/002-dashboard-hardening/plan.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/plan.md)
- Active phase-2 task list: [specs/002-dashboard-hardening/tasks.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/tasks.md)

## Phase 2 Validation

Run the dashboard hardening checks by workspace:

- Backend: `cd backend && npm run validate:phase2`
- Frontend: `cd frontend && npm run validate:phase2`
- AI service: `cd ai-service && python3 -m pytest tests/test_risk_pipeline.py`

Predictive warning outputs must include `riskWarningId`, `elevatorId`, `modelVersion`, `validationRunId`, and `modelTrace` before the backend accepts them for dashboard display.
