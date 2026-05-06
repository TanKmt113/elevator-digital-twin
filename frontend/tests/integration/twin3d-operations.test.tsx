import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TwinScene } from '../../src/modules/twin3d/components/TwinScene';
import { deriveTwinSceneState } from '../../src/modules/twin3d/components/TwinScene';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

function seedTwinScene(): void {
  useElevatorStore.setState({
    elevators: {
      A: {
        elevatorId: 'A',
        buildingId: 'L72',
        status: 'moving',
        currentFloor: 21,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      },
      B: {
        elevatorId: 'B',
        buildingId: 'L72',
        status: 'maintenance',
        currentFloor: 8,
        direction: 'stationary',
        doorState: 'open',
        healthState: 'warning',
        stale: false
      }
    },
    selectedBuildingId: 'L72',
    selectedElevatorId: 'A',
    selectionSource: 'system',
    selectedAt: '2026-05-05T00:00:00.000Z',
    sceneFocusMode: 'overview'
  });
  useRealtimeStore.setState({
    connected: true,
    connectionState: 'live',
    dataState: 'ready',
    sceneRuntime: 'ready',
    projectionCount: 2,
    duplicateEventsDropped: 0,
    outOfOrderEventsRejected: 0,
    staleMessage: undefined
  });
}

describe('twin3d operations runtime', () => {
  it('renders one scene card per in-scope elevator during bootstrap success', () => {
    seedTwinScene();

    const state = deriveTwinSceneState(
      Object.values(useElevatorStore.getState().elevators),
      useElevatorStore.getState().selectedElevatorId,
      useElevatorStore.getState().sceneFocusMode
    );

    expect(state.assets).toHaveLength(2);
    expect(state.visibleAssets.map((asset) => asset.elevatorId)).toEqual(['A', 'B']);
    expect(renderToStaticMarkup(<TwinScene />)).toContain('Mô hình Twin 3D');
  });

  it('shows empty-scene behavior explicitly when no projections exist', () => {
    useElevatorStore.setState({
      elevators: {},
      selectedBuildingId: 'L72',
      selectedElevatorId: undefined,
      selectionSource: undefined,
      selectedAt: undefined,
      sceneFocusMode: 'overview'
    });
    useRealtimeStore.setState({
      connected: true,
      connectionState: 'live',
      dataState: 'empty',
      sceneRuntime: 'empty',
      projectionCount: 0,
      duplicateEventsDropped: 0,
      outOfOrderEventsRejected: 0,
      staleMessage: undefined
    });

    const state = deriveTwinSceneState(
      Object.values(useElevatorStore.getState().elevators),
      useElevatorStore.getState().selectedElevatorId,
      useElevatorStore.getState().sceneFocusMode
    );

    expect(state.visibleAssets).toHaveLength(0);
    expect(renderToStaticMarkup(<TwinScene />)).toContain('Mô hình Twin 3D');
  });

  it('reports dense scene samples when projection count grows', () => {
    expect(measureTwinRenderFrame(18, 12)).toMatchObject({
      frameBudgetExceeded: true,
      projectionCount: 12,
      density: 'dense'
    });
  });

  it('derives live movement animation targets from enhanced state', () => {
    const state = deriveTwinSceneState(
      [
        {
          elevatorId: 'org.example:L72-ELEV-A',
          buildingId: 'L72',
          shaftId: 'shaft-a',
          status: 'moving',
          currentFloor: 4,
          targetFloor: 8,
          positionMeters: 12.6,
          direction: 'up',
          doorState: 'opening',
          doorOpenPercent: 45,
          healthState: 'normal',
          stale: false
        }
      ],
      'org.example:L72-ELEV-A',
      'selected'
    );

    expect(state.visibleAssets[0]).toMatchObject({
      worldPosition: expect.objectContaining({ y: 12.6 }),
      doorOpenRatio: 0.45,
      animationDurationMs: 650,
      isSelected: true
    });
  });
});
