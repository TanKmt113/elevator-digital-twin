import { describe, expect, it } from 'vitest';
import { deriveSceneRuntimeState } from '../../src/app/App';
import { useElevatorStore } from '../../src/store/elevator-store';

describe('true 3d rendering validation', () => {
  it('preserves focused selection when the elevator remains in scope after refresh', () => {
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
      sceneFocusMode: 'selected',
      cameraTransitionState: 'transitioning',
      lastFocusChangeAt: '2026-05-05T00:00:00.000Z'
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

  it('distinguishes unsupported true-3d runtime from normal degraded synchronization', () => {
    expect(deriveSceneRuntimeState('live', 'ready', 2, false)).toBe('unavailable');
    expect(deriveSceneRuntimeState('degraded', 'degraded', 2, true)).toBe('degraded');
  });
});
