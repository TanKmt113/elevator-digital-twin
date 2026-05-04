# Twin Bootstrap Mapping Contract

## Purpose

Define how raw operational Twin Thing payloads are mapped into the dashboard's normalized elevator model during bootstrap.

## Source Shape

The source payload is an authorized Thing document containing:

- `thingId`
- `attributes`
- `features`

## Required Mapping

- `thingId` -> `elevatorId`
- `attributes.buildingId` -> `buildingId`
- `features.elevator.properties.status` -> `status`
- `features.elevator.properties.currentFloor` -> `currentFloor`
- `features.elevator.properties.targetFloor` -> `targetFloor`
- `features.elevator.properties.direction` -> `direction`
- `features.elevator.properties.doorState` -> `doorState`
- `features.elevator.properties.loadPercentage` -> `loadPercentage`
- `features.elevator.properties.healthState` -> `healthState`

## Validation Rules

- Payloads missing `attributes.buildingId` are not admitted into authorized dashboard state.
- Payloads missing the elevator feature mapping are treated as incomplete bootstrap records.
- Unknown enum values are normalized into governed fallback values rather than passed through raw.
