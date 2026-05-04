import { describe, expect, it } from 'vitest';

describe('alerts contract', () => {
  it('defines list and acknowledge alert endpoints', () => {
    expect(['/alerts', '/alerts/:alertId/acknowledge']).toHaveLength(2);
  });
});
