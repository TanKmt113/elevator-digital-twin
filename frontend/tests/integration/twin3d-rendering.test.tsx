import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TwinScene } from '../../src/modules/twin3d/components/TwinScene';
import { deriveTwinSceneState } from '../../src/modules/twin3d/components/TwinScene';
import { measureTwinRenderFrame } from '../../src/modules/twin3d/services/twin3d-performance';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

function seedRenderScene(): void {
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
    sceneFocusMode: 'overview',
    cameraTransitionState: 'idle',
    lastFocusChangeAt: '2026-05-05T00:00:00.000Z'
  });
  useRealtimeStore.setState({
    connected: true,
    connectionState: 'live',
    dataState: 'ready',
    sceneRuntime: 'ready',
    projectionCount: 2,
    hasWebglSupport: false,
    webglMessage: 'WebGL unavailable in test runtime',
    projectionFailures: 0,
    duplicateEventsDropped: 0,
    outOfOrderEventsRejected: 0,
    staleMessage: undefined
  });
}

describe('twin3d rendering runtime', () => {
  it('derives one visible true-3d asset per in-scope elevator', () => {
    seedRenderScene();
    const state = deriveTwinSceneState(
      Object.values(useElevatorStore.getState().elevators),
      useElevatorStore.getState().selectedElevatorId,
      useElevatorStore.getState().sceneFocusMode
    );

    expect(state.visibleAssets).toHaveLength(2);
    expect(state.visibleAssets[0]?.worldPosition).toBeDefined();
  });

  it('renders a controlled fallback when webgl is unavailable', () => {
    seedRenderScene();
    const html = renderToStaticMarkup(<TwinScene />);
    expect(html).toContain('Twin Scene');
  });

  it('tracks dense render load with projection count and frame budget', () => {
    expect(measureTwinRenderFrame(19, 12, true)).toMatchObject({
      density: 'dense',
      frameBudgetExceeded: true,
      projectionCount: 12
    });
  });
});
