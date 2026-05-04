import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('elevator dashboard live updates', () => {
  it('renders loading and empty dashboard states', () => {
    useElevatorStore.setState({ elevators: {} });
    useRealtimeStore.setState({
      connected: false,
      connectionState: 'connecting',
      dataState: 'loading',
      staleMessage: undefined
    });
    expect(renderToStaticMarkup(<App />)).toContain('Loading live building state');

    useRealtimeStore.setState({
      connected: true,
      connectionState: 'live',
      dataState: 'empty',
      staleMessage: undefined
    });
    expect(renderToStaticMarkup(<App />)).toContain('No elevators in active scope');
  });

  it('stores incoming realtime elevator state', () => {
    useRealtimeStore.setState({
      connected: false,
      connectionState: 'connecting',
      dataState: 'loading',
      staleMessage: undefined
    });
    handleRealtimeEvent({
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 12,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });
    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(12);
    expect(useRealtimeStore.getState().dataState).toBe('ready');
    expect(renderToStaticMarkup(<App />)).toContain('Twin synchronization is live');
  });
});
