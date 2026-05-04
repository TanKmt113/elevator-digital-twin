import { describe, expect, it } from 'vitest';
import { fetchElevatorHistory } from '../../src/modules/elevator/services/fetch-elevator-history';

describe('elevator history panel', () => {
  it('loads history points for an elevator', async () => {
    const points = await fetchElevatorHistory('E1');
    expect(points.length).toBeGreaterThan(0);
  });
});
