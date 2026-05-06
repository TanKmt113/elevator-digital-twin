import { describe, expect, it } from 'vitest';
import { fetchElevatorHistory } from '../../src/modules/elevator/services/fetch-elevator-history';
import { mapElevatorStateToScene } from '../../src/modules/twin3d/services/map-elevator-state-to-scene';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useHistoryStore } from '../../src/store/history-store';

describe('elevator history panel', () => {
  it('loads history points for an elevator', async () => {
    const points = await fetchElevatorHistory('E1');
    expect(points.length).toBeGreaterThan(0);
  });

  it('creates playback projection without clobbering live state', async () => {
    useElevatorStore.setState({
      elevators: {
        E1: {
          elevatorId: 'E1',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 12,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      }
    });

    await fetchElevatorHistory('E1');

    expect(useElevatorStore.getState().elevators.E1?.currentFloor).toBe(12);
    const projection = useHistoryStore.getState().playbackProjectionByElevator.E1;
    expect(projection).toMatchObject({ isPlayback: true, currentFloor: 10 });
    expect(mapElevatorStateToScene(projection).isPlayback).toBe(true);
  });
});
