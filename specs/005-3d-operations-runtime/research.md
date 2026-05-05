# Phase 0 Research: 3D Operations Runtime

## Decision: Keep the 3D scene driven by normalized dashboard state instead of adding a separate scene-specific data source

**Rationale**: The dashboard already has a governed elevator state model sourced from the backend. Reusing it keeps list, detail, and 3D behavior synchronized and avoids creating a second interpretation layer for live state.

**Alternatives considered**:
- **Fetch scene state separately from backend**: Rejected because it risks divergence from list and detail views.
- **Read Ditto directly from the frontend for richer 3D data**: Rejected because it violates backend mediation and security boundaries.

## Decision: Treat 3D selection as shared application state, not local component state

**Rationale**: Operators must be able to select from the list or from the scene and retain a single inspection target across the dashboard. Shared store state matches that requirement and survives scene rerenders and realtime updates better than local component state.

**Alternatives considered**:
- **Keep selection local to the 3D scene**: Rejected because it breaks synchronization with list and detail panels.
- **Recompute selection opportunistically after each update**: Rejected because it produces unstable focus behavior during resync and degraded conditions.

## Decision: Make degraded and stale scene state explicit instead of freezing the scene silently

**Rationale**: Operators need to know whether the scene is live or only showing the last accepted state. The existing dashboard synchronization model already distinguishes degraded and stale conditions, so the 3D view should surface that state clearly.

**Alternatives considered**:
- **Show the last frame without any scene-level warning**: Rejected because it makes stale state look healthy.
- **Clear the scene on disconnect**: Rejected because the last accepted state still has operational value when labeled appropriately.

## Decision: Prioritize overview and selected-elevator focus workflows over freeform 3D navigation depth

**Rationale**: This phase is about operator productivity, not exploratory 3D tooling. Reliable overview and focus modes deliver value faster than adding unrestricted scene controls without clear operational behavior.

**Alternatives considered**:
- **Build a rich navigation system first**: Rejected because it adds interaction complexity before the core inspection model is reliable.
- **Leave camera behavior entirely static**: Rejected because operators need a predictable way to inspect selected elevators spatially.

## Decision: Use lightweight scene performance signals and selective updates before larger rendering abstractions

**Rationale**: The current codebase has a simple Twin scene and a basic render-budget helper. Extending those patterns is lower risk than introducing a heavier rendering architecture before real bottlenecks are confirmed.

**Alternatives considered**:
- **Introduce major rendering abstraction or engine changes immediately**: Rejected because the current scale is one local building and the codebase does not justify a deeper rewrite yet.
- **Ignore performance until later**: Rejected because this phase explicitly targets operator usability under live updates.
