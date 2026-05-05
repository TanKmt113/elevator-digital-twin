# True 3D Camera Focus Contract

## Purpose

Define how the true 3D camera behaves across overview and selected-elevator inspection workflows.

## Focus Modes

- `overview`: The camera shows the building-wide arrangement of shafts and cabins.
- `selected`: The camera centers one selected elevator while preserving enough surrounding context for operator orientation.

## Shared Selection Rules

- There is exactly one shared selected elevator context for the active building scope.
- Selection may originate from the dashboard list, detail context, 3D scene, or resynchronization logic.
- A selection change in any supported surface must be reflected in the 3D scene.

## Camera Transition Rules

- Entering `selected` mode must move the camera toward the selected cabin using a bounded, predictable transition.
- Returning to `overview` must restore a predictable building-wide vantage point.
- Normal live state updates must not trigger disruptive camera jumps while the building scope is unchanged.
- Repeated focus changes must not create render loops or uncontrolled camera thrash.

## Selection Continuity Rules

- Live updates must not clear selection if the selected elevator remains in scope.
- Bootstrap refresh must preserve selection when the selected elevator still exists after normalization.
- If the selected elevator disappears from scope, the camera must return to a predictable fallback state and make the change visible to the operator.

## Degraded-State Rules

- When the scene is stale or degraded, the operator may continue inspecting the last accepted selected cabin if it still exists.
- When the scene is unavailable, the interface must disable selected-elevator camera focus and show an explicit explanation.
