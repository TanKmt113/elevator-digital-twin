import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('quickstart flow placeholder', () => {
  it('renders the operator monitoring layout with synchronized sections', () => {
    useElevatorStore.setState({
      elevators: {
        E1: {
          elevatorId: 'E1',
          status: 'moving',
          currentFloor: 10,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      }
    });
    useRealtimeStore.setState({
      connected: true,
      connectionState: 'live',
      dataState: 'ready',
      staleMessage: undefined
    });

    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain('Fleet Overview');
    expect(markup).toContain('Twin Scene');
    expect(markup).toContain('Predictive Warnings');
  });
});
