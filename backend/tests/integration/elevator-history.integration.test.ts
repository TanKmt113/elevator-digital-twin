import { describe, expect, it } from 'vitest';
import { ElevatorHistoryService } from '../../src/modules/elevators/elevator-history.service.js';

describe('elevator history', () => {
  it('returns data within a time window', () => {
    const service = new ElevatorHistoryService();
    service.record({
      elevatorId: 'E1',
      recordedAt: '2026-05-04T10:00:00.000Z',
      currentFloor: 8
    });
    expect(
      service.query('E1', '2026-05-04T09:00:00.000Z', '2026-05-04T11:00:00.000Z')
    ).toHaveLength(1);
  });
});
