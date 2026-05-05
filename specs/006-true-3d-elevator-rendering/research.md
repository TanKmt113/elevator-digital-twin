# Research: True 3D Elevator Rendering

## Decision: Use React Three Fiber as the rendering adapter for the Twin scene

**Rationale**: The project already uses React and state-driven UI composition. React Three Fiber allows the 3D scene to stay aligned with existing dashboard state and selection flows while introducing real 3D geometry, camera control, and render-loop management. It also keeps the render layer local to the frontend without forcing a rewrite of state contracts introduced in phase 005.

**Alternatives considered**:
- Plain DOM or CSS 3D transforms: rejected because they do not provide a reliable path for real spatial depth, camera behavior, or mesh-level interaction.
- Raw Three.js without a React adapter: rejected because it would introduce a larger integration surface and more manual lifecycle/state bridging work against the existing React store architecture.
- External 3D viewer or iframe-based scene: rejected because it would fragment selection, auth, and degraded-state behavior across multiple runtimes.

## Decision: Keep phase 005 scene/runtime and selection contracts as the source for 3D rendering input

**Rationale**: Phase 005 already established governed scene runtime, focus mode, selection continuity, and degraded-state semantics. Reusing those contracts prevents the 3D renderer from becoming a second state engine and preserves constitution requirements around governed data and UI state projection.

**Alternatives considered**:
- Introduce a renderer-specific store independent from the dashboard: rejected because it would duplicate business state and increase drift risk.
- Derive cabin state directly from raw websocket envelopes inside the renderer: rejected because it bypasses normalization and violates backend-mediated state flow.

## Decision: Render simple governed geometry first instead of importing heavy building assets

**Rationale**: The first true-3D phase should validate operator usefulness and runtime stability, not asset-pipeline complexity. Procedural shafts, floors, and cabins are sufficient to show real spatial behavior while keeping local validation deterministic and lightweight.

**Alternatives considered**:
- Import detailed GLB or glTF building assets immediately: rejected because it adds asset management, optimization, and layout dependency risks before the runtime interaction model is proven.
- Use placeholder sprites or flat panels in a 3D camera: rejected because it does not materially advance the scene beyond phase 005.

## Decision: Support two governed camera modes, `overview` and `selected-focus`

**Rationale**: The operator needs predictable building context and a reliable selected-elevator inspection view. Tying camera modes to the shared focus model keeps the interaction contract stable across list, detail, and scene.

**Alternatives considered**:
- Free-form unconstrained camera control only: rejected because it reduces operational predictability and complicates support and testing.
- Always-follow selected elevator with no overview mode: rejected because operators still need building-wide awareness during monitoring.

## Decision: Use live position snapping with bounded smoothing rather than physics simulation

**Rationale**: Elevator operations need accurate operator-facing state, not cinematic simulation. Bounded smoothing can make floor transitions readable without letting the visual scene drift away from accepted operational state.

**Alternatives considered**:
- Full physics or tween system with momentum: rejected because it can misrepresent the true accepted floor state and adds runtime complexity.
- Instant floor jumps only: rejected because it makes live cabin movement harder to interpret in a true 3D scene.

## Decision: Treat WebGL readiness and render responsiveness as explicit observability signals

**Rationale**: A true 3D phase adds new failure modes: WebGL initialization, partial geometry readiness, camera thrash, and frame instability. These must be observable and operator-visible to satisfy the platform's operational gate requirements.

**Alternatives considered**:
- Treat rendering issues as purely cosmetic and log nothing: rejected because a degraded 3D surface directly affects operator trust and usability.
- Add a separate backend observability path for frontend rendering health: rejected for this phase because local frontend runtime signals are sufficient to validate the feature.
