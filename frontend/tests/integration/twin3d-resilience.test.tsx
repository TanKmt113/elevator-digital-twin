import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('twin3d resilience', () => {
  it('flags frames that exceed the budget', () => {
    expect(measureTwinRenderFrame(20).frameBudgetExceeded).toBe(true);
  });

  it('renders a degraded banner when realtime state is stale', () => {
    useRealtimeStore.setState({
      connected: false,
      connectionState: 'stale',
      dataState: 'ready',
      staleMessage: 'Live updates delayed'
    });

    expect(renderToStaticMarkup(<App />)).toContain('Live updates delayed');
  });
});
