import { describe, expect, it } from 'vitest';
import { deriveAppShellState, deriveSceneRuntimeState } from '../../src/app/App';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('elevator dashboard live updates', () => {
  it('derives loading and empty dashboard states', () => {
    expect(deriveAppShellState('connecting', 'loading', 0).title).toBe('Loading live building state');
    expect(deriveAppShellState('live', 'empty', 0).title).toBe('No elevators in active scope');
  });

  it('stores incoming realtime elevator state', () => {
    useRealtimeStore.setState({
      connected: false,
      connectionState: 'connecting',
      dataState: 'loading',
      duplicateEventsDropped: 0,
      outOfOrderEventsRejected: 0,
      staleMessage: undefined
    });
    handleRealtimeEvent({
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 12,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });
    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(12);
    expect(useRealtimeStore.getState().dataState).toBe('ready');
    expect(useRealtimeStore.getState().sceneRuntime).toBe('ready');
    expect(deriveAppShellState('live', 'ready', 1).title).toBe('Twin synchronization is live');
  });

  it('ignores duplicate realtime elevator event ids', () => {
    useElevatorStore.setState({ elevators: {} });
    handleRealtimeEvent({
      eventId: 'evt-duplicate',
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 5,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });
    handleRealtimeEvent({
      eventId: 'evt-duplicate',
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 9,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });

    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(5);
  });

  it('stores backend synchronization state events', () => {
    handleRealtimeEvent({
      eventType: 'system.connection.state',
      payload: {
        frontendRealtimeState: 'degraded',
        connectionState: 'degraded',
        dataState: 'degraded',
        activeSessions: 2,
        duplicateEventsDropped: 2,
        outOfOrderEventsRejected: 1,
        outOfScopeEventsRejected: 4,
        malformedEventsRejected: 3,
        lastFailureReason: 'ditto unavailable'
      }
    });

    expect(useRealtimeStore.getState()).toMatchObject({
      connected: false,
      connectionState: 'degraded',
      dataState: 'degraded',
      frontendRealtimeState: 'degraded',
      activeSessions: 2,
      sceneRuntime: 'degraded',
      duplicateEventsDropped: 2,
      outOfOrderEventsRejected: 1,
      outOfScopeEventsRejected: 4,
      malformedEventsRejected: 3,
      staleMessage: 'ditto unavailable'
    });
  });

  it('keeps the last accepted elevator state while rejected-event counters increase', () => {
    useElevatorStore.setState({
      elevators: {
        A: {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 6,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      }
    });

    handleRealtimeEvent({
      eventType: 'system.connection.state',
      payload: {
        connectionState: 'degraded',
        dataState: 'ready',
        duplicateEventsDropped: 1,
        outOfOrderEventsRejected: 2,
        outOfScopeEventsRejected: 3,
        malformedEventsRejected: 4
      }
    });

    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(6);
    expect(useRealtimeStore.getState()).toMatchObject({
      duplicateEventsDropped: 1,
      outOfOrderEventsRejected: 2,
      outOfScopeEventsRejected: 3,
      malformedEventsRejected: 4
    });
  });

  it('switches to resyncing and invokes recovery callback when resync is required', () => {
    let resyncInvoked = false;

    handleRealtimeEvent(
      {
        eventType: 'dashboard.resync.required',
        payload: {
          buildingId: 'L72',
          reason: 'live_reconnected',
          requestedAt: '2026-05-05T10:00:00.000Z'
        }
      },
      {
        onResyncRequired: () => {
          resyncInvoked = true;
        }
      }
    );

    expect(useRealtimeStore.getState().connectionState).toBe('resyncing');
    expect(resyncInvoked).toBe(true);
  });

  it('keeps scene runtime stale during live synchronization delay', () => {
    expect(deriveSceneRuntimeState('stale', 'ready', 2)).toBe('stale');
  });

  it('keeps scene unavailable when rendering support is missing', () => {
    expect(deriveSceneRuntimeState('live', 'ready', 2, false)).toBe('unavailable');
  });
});
