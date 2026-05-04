import { describe, expect, it } from 'vitest';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';
import { useElevatorStore } from '../../src/store/elevator-store';

describe('elevator dashboard live updates', () => {
  it('stores incoming realtime elevator state', () => {
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
  });
});
