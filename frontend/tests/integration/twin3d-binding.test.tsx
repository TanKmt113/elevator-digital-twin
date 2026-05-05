import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { deriveTwinSceneState, TwinScene } from '../../src/modules/twin3d/components/TwinScene';
import { ElevatorStatusBadge } from '../../src/modules/elevator/components/ElevatorStatusBadge';
import { deriveCameraAnchor } from '../../src/modules/twin3d/contracts/camera-focus';
import { TwinDetailOverlay } from '../../src/modules/twin3d/components/TwinDetailOverlay';
import { mapElevatorStateToScene } from '../../src/modules/twin3d/services/map-elevator-state-to-scene';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

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
    expect(asset.shaftIndex).toBeGreaterThanOrEqual(0);
    expect(asset.floorPosition).toBe(10);
    expect(asset.worldPosition.y).toBe(30);
    expect(asset.movementDirection).toBe('up');
    expect(asset.doorVisualState).toBe('closed');
    expect(asset.healthTone).toBe('normal');
    expect(asset.visualStatus).toBe('moving');
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
      visualStatus: 'stale',
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

  it('derives a selected camera anchor from the shared asset projection', () => {
    const asset = mapElevatorStateToScene({
      elevatorId: 'E5',
      currentFloor: 9,
      direction: 'up',
      doorState: 'closed',
      healthState: 'normal',
      status: 'moving',
      stale: false
    });

    const anchor = deriveCameraAnchor([asset], 'selected', 'E5');
    expect(anchor.target).toEqual([asset.worldPosition.x, asset.worldPosition.y, asset.worldPosition.z]);
    expect(anchor.position[1]).toBeGreaterThan(anchor.target[1]);
  });

  it('keeps scene selection synchronized with the selected elevator context', () => {
    useElevatorStore.setState({
      elevators: {
        E1: {
          elevatorId: 'E1',
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
      selectedElevatorId: 'E1',
      selectionSource: 'list',
      selectedAt: '2026-05-05T00:00:00.000Z',
      sceneFocusMode: 'selected'
    });
    useRealtimeStore.setState({
      connected: true,
      connectionState: 'live',
      dataState: 'ready',
      sceneRuntime: 'ready',
      projectionCount: 1,
      duplicateEventsDropped: 0,
      outOfOrderEventsRejected: 0,
      staleMessage: undefined
    });

    const state = deriveTwinSceneState(
      Object.values(useElevatorStore.getState().elevators),
      useElevatorStore.getState().selectedElevatorId,
      useElevatorStore.getState().sceneFocusMode
    );

    expect(state.visibleAssets.map((asset) => asset.elevatorId)).toEqual(['E1']);
    expect(state.visibleAssets[0]?.isSelected).toBe(true);
    expect(renderToStaticMarkup(<TwinScene />)).toContain('Twin Scene');
  });
});
