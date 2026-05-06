# Contract: Command Lifecycle

## Purpose

Define safe command submission and status delivery for detailed Twin workflows.

## Supported Command Types

- `call_floor`
- `set_service_mode`
- `clear_fault`
- `lock_elevator`
- `unlock_elevator`
- `simulate_event`

## Request Shape

```json
{
  "elevatorId": "org.example:L72-ELEV-A",
  "buildingId": "L72",
  "commandType": "call_floor",
  "parameters": {
    "floor": 12,
    "direction": "up"
  }
}
```

## Status Event

```json
{
  "eventType": "elevator.command.status",
  "schemaVersion": "1.1.0",
  "dataClass": "config",
  "payload": {
    "commandId": "cmd-123",
    "elevatorId": "org.example:L72-ELEV-A",
    "buildingId": "L72",
    "commandType": "call_floor",
    "status": "accepted",
    "policyDecision": "allowed",
    "updatedAt": "2026-05-06T01:20:00.000Z",
    "correlationId": "corr-123"
  }
}
```

## Rules

- Every command requires authentication, role authorization, building scope, state policy, and audit.
- Rejected commands must not mutate live Twin state.
- Simulated commands must be visually distinct from real device commands when shown to operators.
