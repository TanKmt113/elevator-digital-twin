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
    expect(asset.floorPosition).toBe(10);
    expect(asset.movementDirection).toBe('up');
    expect(asset.doorVisualState).toBe('closed');
    expect(asset.healthTone).toBe('normal');
  });

  it('maps stale and transitioning state without raw Twin fields', () => {
    const asset = mapElevatorStateToScene({
      elevatorId: 'E2',
      buildingId: 'L72',
      status: 'maintenance',
      currentFloor: 4,
      direction: 'sideways',
      doorState: 'opening',
      healthState: 'critical',
      stale: true
    }, true);

    expect(asset).toMatchObject({
      buildingId: 'L72',
      movementDirection: 'unknown',
      doorVisualState: 'transitioning',
      healthTone: 'critical',
      isSelected: true,
      isStale: true
    });
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
