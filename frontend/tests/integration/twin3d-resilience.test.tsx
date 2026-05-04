import { describe, expect, it } from 'vitest';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';

describe('twin3d resilience', () => {
  it('flags frames that exceed the budget', () => {
    expect(measureTwinRenderFrame(20).frameBudgetExceeded).toBe(true);
  });
});
