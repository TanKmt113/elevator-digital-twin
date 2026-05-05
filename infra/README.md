# Infrastructure

Local and deployment infrastructure for the platform.

## Phase 7 Notes

- Infrastructure runs must support Ditto bootstrap, live replay, browser realtime delivery, and recovery validation for the realtime synchronization phase.
- Local bring-up order and expected degraded-state behavior are documented in [../specs/007-ditto-realtime-sync/quickstart.md](../specs/007-ditto-realtime-sync/quickstart.md).
- Use `infra/ditto/replay-events.json` with `infra/ditto/replay-ditto-event.ts` to trigger repeatable live changes through the dev replay route.
- Do not start the AI service for phase-7 local validation.
