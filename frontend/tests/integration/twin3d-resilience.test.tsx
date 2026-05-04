import { describe, expect, it } from 'vitest';
import { deriveAppShellState } from '../../src/app/App';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';

describe('twin3d resilience', () => {
  it('flags frames that exceed the budget', () => {
    expect(measureTwinRenderFrame(20).frameBudgetExceeded).toBe(true);
  });

  it('renders a degraded banner when realtime state is stale', () => {
    expect(deriveAppShellState('stale', 'ready', 2).title).toBe('Live updates are degraded');
  });
});
