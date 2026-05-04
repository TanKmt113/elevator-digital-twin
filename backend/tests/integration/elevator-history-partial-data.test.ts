import { describe, expect, it } from 'vitest';
import { ElevatorHistoryService } from '../../src/modules/elevators/elevator-history.service.js';

describe('elevator history partial data', () => {
  it('returns empty results for missing windows', () => {
    const service = new ElevatorHistoryService();
    expect(
      service.query('E1', '2026-05-04T09:00:00.000Z', '2026-05-04T11:00:00.000Z')
    ).toHaveLength(0);
  });
});
