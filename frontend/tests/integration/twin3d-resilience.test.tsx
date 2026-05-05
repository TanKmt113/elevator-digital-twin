import { describe, expect, it } from 'vitest';
import { deriveAppShellState } from '../../src/app/App';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';
import { useElevatorStore } from '../../src/store/elevator-store';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';

describe('twin3d resilience', () => {
  it('flags frames that exceed the budget', () => {
    expect(measureTwinRenderFrame(20, 9)).toMatchObject({
      frameBudgetExceeded: true,
      density: 'moderate'
    });
  });

  it('reports unsupported render capability when WebGL is unavailable', () => {
    expect(measureTwinRenderFrame(5, 2, false).unsupportedReason).toBe('WebGL unavailable');
  });

  it('renders a degraded banner when realtime state is stale', () => {
    expect(deriveAppShellState('stale', 'ready', 2).title).toBe('Live updates are degraded');
  });

  it('preserves focused selection across refresh when the elevator remains in scope', () => {
    useElevatorStore.setState({
      elevators: {
        A: {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 10,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      },
      selectedBuildingId: 'L72',
      selectedElevatorId: 'A',
      selectionSource: '3d',
      selectedAt: '2026-05-05T00:00:00.000Z',
      sceneFocusMode: 'selected'
    });

    useElevatorStore.getState().replaceElevators(
      [
        {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 11,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      ],
      'L72'
    );

    expect(useElevatorStore.getState().selectedElevatorId).toBe('A');
    expect(useElevatorStore.getState().sceneFocusMode).toBe('selected');
  });

  it('preserves selected elevator focus across resync-required state changes', () => {
    useElevatorStore.setState({
      elevators: {
        A: {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 10,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      },
      selectedBuildingId: 'L72',
      selectedElevatorId: 'A',
      selectionSource: '3d',
      selectedAt: '2026-05-05T00:00:00.000Z',
      sceneFocusMode: 'selected'
    });

    handleRealtimeEvent({
      eventType: 'dashboard.resync.required',
      payload: {
        buildingId: 'L72',
        reason: 'live_reconnected',
        requestedAt: '2026-05-05T10:00:00.000Z'
      }
    });

    expect(useElevatorStore.getState().selectedElevatorId).toBe('A');
    expect(useElevatorStore.getState().sceneFocusMode).toBe('selected');
  });
});
