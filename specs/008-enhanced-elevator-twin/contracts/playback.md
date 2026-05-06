# Contract: Playback

## Purpose

Define recent-history playback for enhanced elevator state without mutating live state.

## Query

```text
GET /elevators/{elevatorId}/history?buildingId=L72&from=2026-05-06T01:10:00Z&to=2026-05-06T01:15:00Z&resolution=1s
```

## Response Shape

```json
{
  "items": [
    {
      "snapshotId": "hist-1",
      "elevatorId": "org.example:L72-ELEV-A",
      "buildingId": "L72",
      "capturedAt": "2026-05-06T01:12:00.000Z",
      "partial": false,
      "missingFields": [],
      "twin": {}
    }
  ],
  "meta": {
    "from": "2026-05-06T01:10:00.000Z",
    "to": "2026-05-06T01:15:00.000Z",
    "resolution": "1s",
    "partial": false
  }
}
```

## Rules

- Playback must clearly set the frontend to historical mode.
- Live state must continue to be preserved separately.
- Partial history must include `missingFields`.
- Authorization uses the same building scope as live state.
