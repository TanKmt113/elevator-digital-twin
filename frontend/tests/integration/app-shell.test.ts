import { describe, expect, it } from 'vitest';
import { deriveAppShellState, deriveSceneRuntimeState } from '../../src/app/App';

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

  it('reports an explicit resyncing state while the dashboard refreshes accepted state', () => {
    expect(deriveAppShellState('resyncing', 'ready', 2)).toMatchObject({
      title: 'Resynchronizing live state',
      bannerTone: 'info'
    });
  });

  it('derives governed scene runtime states from dashboard synchronization', () => {
    expect(deriveSceneRuntimeState('connecting', 'loading', 0)).toBe('loading');
    expect(deriveSceneRuntimeState('live', 'empty', 0)).toBe('empty');
    expect(deriveSceneRuntimeState('stale', 'ready', 2)).toBe('stale');
    expect(deriveSceneRuntimeState('degraded', 'degraded', 2)).toBe('degraded');
    expect(deriveSceneRuntimeState('live', 'ready', 2)).toBe('ready');
    expect(deriveSceneRuntimeState('live', 'ready', 2, false)).toBe('unavailable');
  });
});
