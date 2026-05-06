# Research: Ditto Realtime Synchronization

## Decision 1: Use backend-managed push delivery as the only browser realtime path

- **Decision**: Deliver accepted Twin changes to browsers through the backend's managed realtime channel, with the frontend consuming normalized event envelopes only from the backend.
- **Rationale**: This preserves the control-plane boundary, allows scope enforcement and event rejection before publication, and keeps the UI aligned with governed contracts rather than raw Ditto payloads.
- **Alternatives considered**:
  - Direct frontend subscription to Ditto: rejected because it violates backend mediation and leaks Twin credentials and schema drift into the browser.
  - Frontend polling of backend state: rejected because the constitution explicitly disallows polling as a substitute for realtime architecture.

## Decision 2: Treat Ditto live ingestion and browser delivery as separate health domains

- **Decision**: Model Twin live consumption, backend publication, and frontend session delivery as distinct synchronization concerns with explicit health and degraded signals.
- **Rationale**: The current gap is not only missing data flow but also missing diagnosability. Operators and developers need to distinguish "Ditto changed but backend never consumed it" from "backend accepted it but browser delivery failed."
- **Alternatives considered**:
  - Single generic realtime health flag: rejected because it hides the failure boundary and makes troubleshooting ambiguous.
  - Client-only connectivity banner: rejected because it cannot describe upstream Twin ingestion failures.

## Decision 3: Recover from missed delivery through backend-mediated resynchronization

- **Decision**: When a client reconnects or the backend suspects missed delivery, the client should fetch the current accepted state snapshot from the backend and then resume live processing.
- **Rationale**: Materialized state already exists in the backend and is the safest recovery source after disconnects, out-of-order delivery, or event loss. This avoids trying to replay arbitrary retained Twin history in the browser.
- **Alternatives considered**:
  - Replay raw Ditto history to the client: rejected because the browser should not reason about raw Twin events or ordering.
  - Clear all client state on reconnect: rejected because it causes disruptive operator context loss and violates graceful degradation.

## Decision 4: Apply event acceptance rules before state mutation and publication

- **Decision**: Duplicate, out-of-order, malformed, and out-of-scope Twin changes must be rejected before they update backend state or reach connected sessions.
- **Rationale**: The normalized dashboard state must represent the latest accepted operational truth. Rejecting bad events after publication would still create visible false transitions.
- **Alternatives considered**:
  - Publish first and let the frontend ignore bad events: rejected because it duplicates business rules in the UI and breaks consistency across clients.
  - Accept all events and repair by later snapshot: rejected because transient incorrect states are still operator-visible.

## Decision 5: Keep the existing normalized elevator envelope as the canonical browser contract

- **Decision**: Extend the current versioned realtime envelope and synchronization state instead of inventing a second browser contract just for Ditto live changes.
- **Rationale**: The frontend already maps normalized elevator payloads into summary, detail, and 3D views. Reusing that contract minimizes projection drift and keeps tests focused on the transport and runtime gap.
- **Alternatives considered**:
  - Separate Ditto-live browser payloads: rejected because it would introduce a second projection model and duplicate normalization logic.
  - Raw feature-level per-view payloads: rejected because the dashboard must remain store-driven, not component-driven.
