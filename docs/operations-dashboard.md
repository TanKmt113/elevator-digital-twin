# Operations Dashboard Guide

## Local Bring-Up

1. Start dependencies with `infra/docker/docker-compose.yml`.
2. Start backend, frontend, and AI service workspaces.
3. Confirm backend readiness includes Twin bootstrap and analytics readiness.
4. Use simulated realtime events to validate monitoring, commands, alerts, 3D view, history, and risk warnings.
5. Run the predictive warning validation path and confirm the dashboard shows model version and validation run metadata.

## Ditto Integration

- Eclipse Ditto HTTP contract used by this project: [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml)
- Working integration guide for backend usage: [ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md)

## Phase 2 Focus

- Phase-2 spec: [specs/002-dashboard-hardening/spec.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/spec.md)
- Phase-2 plan: [specs/002-dashboard-hardening/plan.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/plan.md)
- Phase-2 quickstart: [specs/002-dashboard-hardening/quickstart.md](/home/tandev/WorkDev/elevator-digital-twin/specs/002-dashboard-hardening/quickstart.md)

## Predictive Warning Readiness

- Accepted warnings must be traceable to a model version and validation run.
- The backend rejects analytics warnings missing `modelVersion` or `modelTrace` and reports degraded analytics readiness until a valid warning is accepted.
- The dashboard labels warnings without model metadata as unverified instead of presenting them as release-ready predictions.
