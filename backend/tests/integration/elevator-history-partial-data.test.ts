import { describe, expect, it } from 'vitest';
import { ElevatorHistoryService } from '../../src/modules/elevators/elevator-history.service.js';

describe('elevator history partial data', () => {
  it('returns empty results for missing windows', () => {
    const service = new ElevatorHistoryService();
    expect(
      service.query('E1', '2026-05-04T09:00:00.000Z', '2026-05-04T11:00:00.000Z')
    ).toHaveLength(0);
  });

  it('marks playback snapshots partial when enhanced fields are missing', () => {
    const service = new ElevatorHistoryService();
    service.record({
      elevatorId: 'E1',
      buildingId: 'L72',
      recordedAt: '2026-05-06T01:12:00.000Z',
      currentFloor: 4
    });

    const response = service.queryPlayback(
      'E1',
      'L72',
      '2026-05-06T01:10:00.000Z',
      '2026-05-06T01:15:00.000Z'
    );

    expect(response.meta.partial).toBe(true);
    expect(response.items[0]).toMatchObject({
      partial: true,
      missingFields: ['positionMeters', 'doorOpenPercent', 'loadPercentage']
    });
  });
});
