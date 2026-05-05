# Operations Dashboard Guide

## Local Bring-Up

1. Start dependencies with `infra/docker/docker-compose.yml`.
2. Start backend and frontend workspaces.
3. Confirm backend readiness includes Twin bootstrap and synchronization state.
4. Use simulated realtime events to validate monitoring, commands, alerts, 3D view, and history.
5. Leave the AI service stopped for the phase-6 validation path.

## Ditto Integration

- Eclipse Ditto HTTP contract used by this project: [ditto-api-2.yml](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-api-2.yml)
- Working integration guide for backend usage: [ditto-integration.md](/home/tandev/WorkDev/elevator-digital-twin/docs/ditto-integration.md)

## Phase 7 Focus

- Phase-7 spec: [specs/007-ditto-realtime-sync/spec.md](../specs/007-ditto-realtime-sync/spec.md)
- Phase-7 plan: [specs/007-ditto-realtime-sync/plan.md](../specs/007-ditto-realtime-sync/plan.md)
- Phase-7 quickstart: [specs/007-ditto-realtime-sync/quickstart.md](../specs/007-ditto-realtime-sync/quickstart.md)
- Realtime event contract: [specs/007-ditto-realtime-sync/contracts/realtime-events.md](../specs/007-ditto-realtime-sync/contracts/realtime-events.md)
- Resync sequence contract: [specs/007-ditto-realtime-sync/contracts/resync-sequence.md](../specs/007-ditto-realtime-sync/contracts/resync-sequence.md)

## Degraded Twin Behavior

- Twin bootstrap reports `loading`, `completed`, `empty`, or `failed` through backend health and synchronization metadata.
- Live synchronization reports `live`, `stale`, `degraded`, or `resyncing` while preserving the last accepted elevator state.
- Live rejection counters distinguish duplicate, out-of-order, out-of-scope, and malformed event loss modes.
- The dashboard and 3D scene render empty or degraded states explicitly instead of relying on AI output or blank placeholders.
- Scene overlays must expose stale or degraded context without hiding the last accepted elevator projection.
- Unsupported 3D capability or WebGL initialization failure must show an explicit unavailable-scene fallback.

## Operator Runbook Notes

- Use the Twin scene `All` control to return to building overview while keeping the current elevator identity available for detail inspection.
- Use the Twin scene `Focus` control only after selecting an elevator from the list or the scene itself.
- If the browser cannot initialize the true 3D scene, validate fallback messaging before debugging Twin synchronization.
- Use the developer replay route or replay script when validating live propagation locally instead of editing frontend state manually.
- Frontend operators should access Twin state only through the backend bootstrap and backend-mediated realtime channel; no direct Ditto browser access is part of the supported runtime.
- The supported runtime does not use polling as a fallback for live monitoring; if updates stall, debug backend-mediated websocket delivery and Ditto live ingestion instead.

## Predictive Warning Readiness

- Accepted warnings must be traceable to a model version and validation run.
- The backend rejects analytics warnings missing `modelVersion` or `modelTrace` and reports degraded analytics readiness until a valid warning is accepted.
- The dashboard labels warnings without model metadata as unverified instead of presenting them as release-ready predictions.
