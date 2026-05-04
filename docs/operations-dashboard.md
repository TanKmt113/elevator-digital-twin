# Operations Dashboard Guide

## Local Bring-Up

1. Start dependencies with `infra/docker/docker-compose.yml`.
2. Start backend and frontend workspaces.
3. Confirm backend readiness includes Twin bootstrap and synchronization state.
4. Use simulated realtime events to validate monitoring, commands, alerts, 3D view, and history.
5. Leave the AI service stopped for the phase-3 validation path.

## Ditto Integration

- Eclipse Ditto HTTP contract used by this project: [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml)
- Working integration guide for backend usage: [ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md)

## Phase 3 Focus

- Phase-3 spec: [specs/003-digital-twin-3d/spec.md](../specs/003-digital-twin-3d/spec.md)
- Phase-3 plan: [specs/003-digital-twin-3d/plan.md](../specs/003-digital-twin-3d/plan.md)
- Phase-3 quickstart: [specs/003-digital-twin-3d/quickstart.md](../specs/003-digital-twin-3d/quickstart.md)
- Digital Twin and 3D phase notes: [digital-twin-3d-next-phase.md](digital-twin-3d-next-phase.md)

## Degraded Twin Behavior

- Twin bootstrap reports `loading`, `completed`, `empty`, or `failed` through backend health and synchronization metadata.
- Live synchronization reports `live`, `stale`, `degraded`, or `resyncing` while preserving the last accepted elevator state.
- The dashboard and 3D scene render empty or degraded states explicitly instead of relying on AI output or blank placeholders.

## Predictive Warning Readiness

- Accepted warnings must be traceable to a model version and validation run.
- The backend rejects analytics warnings missing `modelVersion` or `modelTrace` and reports degraded analytics readiness until a valid warning is accepted.
- The dashboard labels warnings without model metadata as unverified instead of presenting them as release-ready predictions.
