import { describe, expect, it } from 'vitest';
import { deriveSceneRuntimeState } from '../../src/app/App';
import { useElevatorStore } from '../../src/store/elevator-store';

describe('twin3d interactions', () => {
  it('preserves focus mode when the selected elevator remains in scope', () => {
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

    expect(useElevatorStore.getState().sceneFocusMode).toBe('selected');
    expect(useElevatorStore.getState().selectedElevatorId).toBe('A');
  });

  it('derives a stale scene runtime while preserving accepted data', () => {
    expect(deriveSceneRuntimeState('stale', 'ready', 2)).toBe('stale');
  });
});
