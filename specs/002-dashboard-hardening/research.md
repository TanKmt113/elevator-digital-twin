# Phase 0 Research: Dashboard Hardening and Operational Readiness

## Decision: Use Twin HTTP bootstrap plus live Twin stream reconciliation

**Rationale**: The dashboard currently needs both an initial current-state load and continued live synchronization. Bootstrapping from the Twin's current visible Thing state closes the startup gap, while live event delivery preserves the event-driven model after initialization.

**Alternatives considered**:
- **Wait only for new live events after startup**: Rejected because operators would see incomplete or stale state until the next event arrives.
- **Persist bootstrap state only in local storage and reuse it blindly**: Rejected because it risks showing unauthorized or outdated operational state.

## Decision: Keep a single normalized elevator state model across bootstrap and live updates

**Rationale**: Operators should not experience different field semantics depending on whether state came from bootstrap, alert-driven updates, or live event delivery. A single normalized model reduces UI branching and reconciliation bugs.

**Alternatives considered**:
- **Separate bootstrap DTO and live event DTO inside the frontend**: Rejected because it pushes business reconciliation into the UI layer.
- **Pass Twin payloads through unmodified**: Rejected because it weakens schema governance and ties the dashboard to Twin-specific structures.

## Decision: Enforce contract-aligned elevator list queries by building scope

**Rationale**: The published contract already requires `buildingId` for elevator listing, and building scope is an authorization boundary. Aligning runtime behavior with the contract reduces ambiguity and prepares the route for real authorization-aware queries.

**Alternatives considered**:
- **Keep a global list route without required scope**: Rejected because it conflicts with the published contract and future multi-building behavior.
- **Infer building scope only from frontend state**: Rejected because the backend must remain the control plane for authorization and filtering.

## Decision: Upgrade the frontend through operator workflow layout rather than ad hoc component styling

**Rationale**: The remaining UI gap is not just decorative; operators need clear hierarchy, empty states, degraded states, and cross-panel coherence. A layout-first pass gives the dashboard operational usability instead of isolated styled widgets.

**Alternatives considered**:
- **Add styles component by component without a shared layout pass**: Rejected because it risks a visually inconsistent dashboard with repeated state handling.
- **Delay UI polish until after all backend work is complete**: Rejected because operator-grade usability is part of feature completeness, not optional cosmetic work.

## Decision: Validate the AI risk flow with an explicit end-to-end local verification path

**Rationale**: The AI service already exists but is not yet verified as part of one documented local run. A named validation path ensures predictive warnings are testable and observable as part of the full platform.

**Alternatives considered**:
- **Rely only on isolated service tests**: Rejected because it does not prove the backend ingestion and dashboard display path works.
- **Treat AI verification as a later operations task**: Rejected because the feature currently advertises predictive warnings as part of the platform scope.
