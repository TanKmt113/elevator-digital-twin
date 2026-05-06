# 3D Scene Interaction Contract

## Purpose

Define how selection and focus behave across the 3D scene and the rest of the operations dashboard.

## Shared Selection Rules

- There is exactly one shared selected elevator context for the active building scope.
- Selection may originate from:
  - dashboard list
  - detail context
  - 3D scene
  - system resynchronization logic
- A selection change in any surface must be reflected in every other surface.

## Focus Modes

- `overview`: The scene shows the building-wide elevator fleet without locking on a single elevator.
- `selected`: The scene visually focuses one selected elevator while preserving surrounding context.

## Operator Controls

- The scene exposes an overview action that returns to building-wide context without erasing the current selected elevator identity.
- The scene exposes a selected-focus action that becomes active only when a selected elevator exists.

## Selection Continuity Rules

- Live updates must not clear selection if the selected elevator remains in scope.
- Bootstrap resync must preserve selection when the same elevator still exists in the refreshed dataset.
- If the selected elevator disappears from scope, the system must clear or reassign focus predictably and visibly.

## Degraded-State Interaction Rules

- When the scene is stale or degraded, the currently selected elevator remains inspectable if its last accepted projection is still available.
- Stale or degraded state must be visible in the scene overlay or equivalent operator-facing context.
- Interaction must not imply that stale geometry is fully live.

## Camera Behavior Expectations

- Operators must have a reliable overview mode and a reliable selected-elevator focus mode.
- Normal live updates must not cause disruptive camera jumps while the building scope remains unchanged.
- Reset or overview actions must return the operator to a predictable building-wide view.
- Repeated focus changes must not create render loops or uncontrolled state churn in the shared selection store.
