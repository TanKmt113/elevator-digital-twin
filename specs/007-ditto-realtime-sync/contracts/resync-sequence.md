# Contract: Reconnect And Resynchronization Sequence

## Purpose

Define the expected recovery sequence when browser realtime delivery or Twin live ingestion is interrupted after the dashboard has already loaded current state.

## Nominal Recovery Flow

1. Client loses live delivery or backend marks synchronization as stale.
2. Backend or client transitions session state to `stale` or `resyncing`.
3. Backend emits `dashboard.resync.required` or the client initiates a controlled resync after reconnect.
4. Client fetches the current accepted elevator snapshot for the active building scope.
5. Client replaces its in-memory elevator state with the resynchronized snapshot.
6. Backend resumes `elevator.state.changed` delivery for subsequent accepted live changes.
7. Client returns synchronization state to `live`.

## Contract Rules

- Resync must use backend-mediated current state, not direct Twin access.
- Resync must be scoped to the authorized building.
- Resync must preserve selected-elevator context when that elevator remains in scope.
- If resync fails, the dashboard remains explicit about degraded state and continues showing the last accepted state when available.
- Resync must not replay rejected or superseded Twin changes into the browser.

## Observable Outcomes

- Operators see `stale` or `degraded` quickly after interruption.
- Operators see `resyncing` during snapshot recovery.
- The dashboard returns to `live` only after current accepted state is applied successfully.
- Health and logs identify whether the interruption originated in Twin live ingestion, backend delivery, or browser connectivity.
