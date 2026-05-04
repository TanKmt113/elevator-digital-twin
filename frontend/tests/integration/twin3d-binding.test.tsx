import { describe, expect, it } from 'vitest';
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
});
