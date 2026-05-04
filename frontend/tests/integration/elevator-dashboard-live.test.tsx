import { describe, expect, it } from 'vitest';
import { deriveAppShellState } from '../../src/app/App';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('elevator dashboard live updates', () => {
  it('derives loading and empty dashboard states', () => {
    expect(deriveAppShellState('connecting', 'loading', 0).title).toBe('Loading live building state');
    expect(deriveAppShellState('live', 'empty', 0).title).toBe('No elevators in active scope');
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
    expect(deriveAppShellState('live', 'ready', 1).title).toBe('Twin synchronization is live');
  });
});
