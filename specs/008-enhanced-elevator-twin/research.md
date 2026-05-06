# Research: Enhanced Elevator Digital Twin

## Decision: Extend the Existing Normalized Elevator Contract

**Rationale**: Current list, detail, realtime, and 3D surfaces already depend on one backend-normalized elevator state. Extending that contract preserves a single accepted state and avoids parallel models that drift.

**Alternatives considered**:

- Add a separate detailed-Twin endpoint only for the detail panel. Rejected because list, 3D, history, alerts, and commands would still diverge.
- Let frontend read raw Ditto for advanced fields. Rejected because it violates the backend-mediated Twin authority boundary.

## Decision: Hydrate Partial Ditto Events Before Publishing

**Rationale**: Ditto merge events may contain only changed fields and omit required scope fields such as `buildingId`. The backend should resolve the full Thing or merge with the last accepted materialized state before frontend publication.

**Alternatives considered**:

- Reject all partial updates. Rejected because Ditto UI and normal merge flows commonly produce partial events.
- Publish partial frontend patches. Rejected because UI surfaces need complete, scoped, governed state.

## Decision: Keep 3D Projection as a Derived Frontend Model

**Rationale**: Backend owns operational truth; frontend derives render-ready position, animation, color, labels, and camera targets from accepted state plus building layout.

**Alternatives considered**:

- Persist render state in Ditto. Rejected because visual projection is UI-specific and should not become authoritative elevator state.
- Compute all scene geometry server-side. Rejected for MVP because layout is small and frontend already owns Three.js rendering.

## Decision: Use Bounded Recent Playback First

**Rationale**: The feature needs diagnostic playback without forcing a new long-term analytics platform. Existing history services and local repositories can support bounded validation while preserving future expansion.

**Alternatives considered**:

- Require Timescale/Mongo production history before any playback. Rejected because it increases scope before validating operator workflow.
- Store playback only in browser memory. Rejected because reloads and multi-session validation need backend-mediated history.

## Decision: Commands Remain Policy-Gated and Audited

**Rationale**: Controls affect operational safety. Existing command policy and audit flows should be extended instead of bypassed for 3D/detail convenience.

**Alternatives considered**:

- Direct frontend command simulation. Rejected because it bypasses policy and audit.
- Hide commands until real device control exists. Rejected because simulation and policy validation are useful for local workflows.
