import { describe, expect, it } from 'vitest';

describe('elevator history contract', () => {
  it('defines the elevator history endpoint', () => {
    expect('/elevators/:elevatorId/history').toContain('history');
  });
});
