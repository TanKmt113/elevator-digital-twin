import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ElevatorStatusBadge } from '../../src/modules/elevator/components/ElevatorStatusBadge';
import { TwinDetailOverlay } from '../../src/modules/twin3d/components/TwinDetailOverlay';
import { mapElevatorStateToScene } from '../../src/modules/twin3d/services/map-elevator-state-to-scene';

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
    const elevator = {
      elevatorId: 'E1',
      status: 'moving',
      currentFloor: 10,
      direction: 'up',
      doorState: 'closed',
      healthState: 'normal',
      stale: false
    };

    expect(renderToStaticMarkup(<ElevatorStatusBadge status={elevator.status} stale={elevator.stale} />)).toContain('moving');
    expect(
      renderToStaticMarkup(
        <TwinDetailOverlay
          elevator={elevator}
        />
      )
    ).toContain('E1');
  });
});
