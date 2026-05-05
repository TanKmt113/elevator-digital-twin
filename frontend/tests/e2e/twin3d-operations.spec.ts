import { describe, expect, it } from 'vitest';
import { deriveSceneRuntimeState } from '../../src/app/App';
import { useElevatorStore } from '../../src/store/elevator-store';

describe('twin3d operations e2e coverage', () => {
  it('clears focus predictably when the selected elevator disappears from scope', () => {
    useElevatorStore.setState({
      elevators: {
        A: {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 4,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      },
      selectedBuildingId: 'L72',
      selectedElevatorId: 'A',
      selectionSource: 'list',
      selectedAt: '2026-05-05T00:00:00.000Z',
      sceneFocusMode: 'selected'
    });

    useElevatorStore.getState().replaceElevators([], 'L72');

    expect(useElevatorStore.getState().selectedElevatorId).toBeUndefined();
    expect(useElevatorStore.getState().sceneFocusMode).toBe('overview');
  });

  it('keeps degraded and stale runtimes distinct for operator messaging', () => {
    expect(deriveSceneRuntimeState('degraded', 'degraded', 1)).toBe('degraded');
    expect(deriveSceneRuntimeState('stale', 'ready', 1)).toBe('stale');
  });
});
