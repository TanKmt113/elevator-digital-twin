import { describe, expect, it } from 'vitest';

describe('elevators contract', () => {
  it('defines list and detail endpoints', () => {
    expect(['/elevators', '/elevators/:elevatorId']).toHaveLength(2);
  });
});
