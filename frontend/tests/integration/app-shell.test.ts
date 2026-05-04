import { describe, expect, it } from 'vitest';
import { deriveAppShellState } from '../../src/app/App';

describe('app shell', () => {
  it('reports loading state before dashboard data is ready', () => {
    expect(deriveAppShellState('connecting', 'loading', 0)).toMatchObject({
      title: 'Loading live building state',
      bannerTone: 'info'
    });
  });

  it('reports empty state when no elevator data is available', () => {
    expect(deriveAppShellState('live', 'empty', 0)).toMatchObject({
      title: 'No elevators in active scope',
      bannerTone: 'neutral'
    });
  });

  it('reports degraded state when synchronization is stale', () => {
    expect(deriveAppShellState('stale', 'ready', 2)).toMatchObject({
      title: 'Live updates are degraded',
      bannerTone: 'warning'
    });
  });
});
