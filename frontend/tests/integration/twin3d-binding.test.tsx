import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ElevatorList } from '../../src/modules/elevator/components/ElevatorList';
import { TwinDetailOverlay } from '../../src/modules/twin3d/components/TwinDetailOverlay';
import { mapElevatorStateToScene } from '../../src/modules/twin3d/services/map-elevator-state-to-scene';
import { useElevatorStore } from '../../src/store/elevator-store';

describe('twin3d binding', () => {
  it('maps elevator floor to scene y position', () => {
    const asset = mapElevatorStateToScene({
      elevatorId: 'E1',
      status: 'moving',
      currentFloor: 10,
      direction: 'up',
      doorState: 'closed',
      healthState: 'normal',
      stale: false
    });
    expect(asset.y).toBe(30);
  });

  it('keeps list and overlay aligned on the same elevator identity', () => {
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

    expect(renderToStaticMarkup(<ElevatorList />)).toContain('E1');
    expect(
      renderToStaticMarkup(
        <TwinDetailOverlay
          elevator={useElevatorStore.getState().elevators.E1}
        />
      )
    ).toContain('E1');
  });
});
