# Operations Dashboard Guide

## Local Bring-Up

1. Start dependencies with `infra/docker/docker-compose.yml`.
2. Start backend and frontend workspaces.
3. Confirm backend readiness includes Twin bootstrap and synchronization state.
4. Use simulated realtime events to validate monitoring, commands, alerts, 3D view, and history.
5. Leave the AI service stopped for the phase-5 validation path.

## Ditto Integration

- Eclipse Ditto HTTP contract used by this project: [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml)
- Working integration guide for backend usage: [ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md)

## Phase 5 Focus

- Phase-5 spec: [specs/005-3d-operations-runtime/spec.md](../specs/005-3d-operations-runtime/spec.md)
- Phase-5 plan: [specs/005-3d-operations-runtime/plan.md](../specs/005-3d-operations-runtime/plan.md)
- Phase-5 quickstart: [specs/005-3d-operations-runtime/quickstart.md](../specs/005-3d-operations-runtime/quickstart.md)
- Scene interaction contract: [specs/005-3d-operations-runtime/contracts/scene-interactions.md](../specs/005-3d-operations-runtime/contracts/scene-interactions.md)
- Scene state contract: [specs/005-3d-operations-runtime/contracts/scene-state.md](../specs/005-3d-operations-runtime/contracts/scene-state.md)

## Degraded Twin Behavior

- Twin bootstrap reports `loading`, `completed`, `empty`, or `failed` through backend health and synchronization metadata.
- Live synchronization reports `live`, `stale`, `degraded`, or `resyncing` while preserving the last accepted elevator state.
- The dashboard and 3D scene render empty or degraded states explicitly instead of relying on AI output or blank placeholders.
- Scene overlays must expose stale or degraded context without hiding the last accepted elevator projection.

## Operator Runbook Notes

- Use the Twin scene `All` control to return to building overview while keeping the current elevator identity available for detail inspection.
- Use the Twin scene `Focus` control only after selecting an elevator from the list or the scene itself.
- Frontend operators should access Twin state only through the backend bootstrap and backend-mediated realtime channel; no direct Ditto browser access is part of the supported runtime.

## Predictive Warning Readiness

- Accepted warnings must be traceable to a model version and validation run.
- The backend rejects analytics warnings missing `modelVersion` or `modelTrace` and reports degraded analytics readiness until a valid warning is accepted.
- The dashboard labels warnings without model metadata as unverified instead of presenting them as release-ready predictions.
