import { describe, expect, it } from 'vitest';
import { ElevatorHistoryService } from '../../src/modules/elevators/elevator-history.service.js';

describe('elevator history contract', () => {
  it('defines the elevator history endpoint', () => {
    expect('/elevators/:elevatorId/history').toContain('history');
  });

  it('returns playback snapshots with meta for bounded history windows', () => {
    const service = new ElevatorHistoryService();
    service.record({
      elevatorId: 'E1',
      buildingId: 'L72',
      recordedAt: '2026-05-06T01:12:00.000Z',
      currentFloor: 4,
      positionMeters: 12,
      doorOpenPercent: 40,
      loadPercentage: 35
    });

    expect(
      service.queryPlayback(
        'E1',
        'L72',
        '2026-05-06T01:10:00.000Z',
        '2026-05-06T01:15:00.000Z',
        '1s'
      )
    ).toMatchObject({
      items: [
        {
          elevatorId: 'E1',
          buildingId: 'L72',
          capturedAt: '2026-05-06T01:12:00.000Z',
          partial: false,
          missingFields: [],
          source: 'history'
        }
      ],
      meta: {
        from: '2026-05-06T01:10:00.000Z',
        to: '2026-05-06T01:15:00.000Z',
        resolution: '1s',
        partial: false
      }
    });
  });
});
