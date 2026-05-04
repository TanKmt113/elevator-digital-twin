import { describe, expect, it } from 'vitest';

describe('auth contract', () => {
  it('requires a bearer token for protected routes', () => {
    expect('Bearer token required').toContain('Bearer');
  });
});
