# Phase 0 Research: Digital Twin and 3D Operations View

## Decision: Prioritize Twin bootstrap before 3D refinement

**Rationale**: The 3D view is only useful when it is driven by authoritative current state. Loading from the Twin first prevents the scene from depending on stale seed data or only newly arriving events.

**Alternatives considered**:
- **Polish the 3D scene first**: Rejected because a better scene with unreliable state would still mislead operators.
- **Wait only for live events**: Rejected because operators need current state immediately after dashboard load.

## Decision: Keep backend-normalized state as the only frontend input

**Rationale**: The backend already owns authorization, normalization, and event acceptance. The frontend should render governed state, not raw Twin payloads.

**Alternatives considered**:
- **Frontend calls Ditto directly**: Rejected because it violates the security and architecture boundary.
- **Separate 3D-only state model**: Rejected because it risks drift between the list, detail panel, and 3D view.

## Decision: Treat 3D as an operator projection, not a separate source of truth

**Rationale**: Selection and visuals in the 3D scene should reflect normalized elevator state and shared dashboard selection. This keeps the workflow predictable.

**Alternatives considered**:
- **Maintain separate 3D selection state**: Rejected because list and scene selection can diverge.
- **Render decorative 3D without operational state**: Rejected because the feature goal is inspection, not visual decoration.

## Decision: Validate degraded Twin behavior without requiring AI

**Rationale**: The next phase must be demonstrable with backend, frontend, and Twin-compatible infrastructure only. AI service availability must not block Digital Twin and 3D validation.

**Alternatives considered**:
- **Keep AI in quickstart validation**: Rejected because the user explicitly deferred AI-related work.
- **Hide risk panels by default**: Deferred to implementation planning; the functional requirement is only that AI is not required for this phase.
