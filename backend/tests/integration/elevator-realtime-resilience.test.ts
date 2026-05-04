import { describe, expect, it } from 'vitest';
import { SessionStalenessPolicy } from '../../src/modules/realtime/session-manager.js';

describe('elevator realtime resilience', () => {
  it('marks old state as stale', () => {
    const policy = new SessionStalenessPolicy();
    expect(policy.isStale('2000-01-01T00:00:00.000Z')).toBe(true);
  });
});
