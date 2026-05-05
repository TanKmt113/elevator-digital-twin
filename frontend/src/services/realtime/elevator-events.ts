import type { ElevatorViewModel } from '../../store/elevator-store';
import { useElevatorStore } from '../../store/elevator-store';
import {
  useRealtimeStore,
  type DashboardDataState,
  type RealtimeConnectionState
} from '../../store/realtime-store';
import { deriveSceneRuntimeState } from '../../app/App';

interface ElevatorStateEnvelope {
  eventType: string;
  payload: ElevatorViewModel | Record<string, unknown>;
}

export function handleRealtimeEvent(
  event: ElevatorStateEnvelope,
  options?: { onResyncRequired?: () => void }
): void {
  if (event.eventType === 'elevator.state.changed') {
    useElevatorStore.getState().upsertElevator(event.payload as ElevatorViewModel);
    useRealtimeStore.getState().setConnected(true);
    useRealtimeStore.getState().setDataState('ready');
    const projectionCount = Object.keys(useElevatorStore.getState().elevators).length;
    useRealtimeStore
      .getState()
      .setSceneRuntime(
        deriveSceneRuntimeState('live', 'ready', projectionCount, useRealtimeStore.getState().hasWebglSupport),
        projectionCount
      );
  }

  if (event.eventType === 'system.connection.state') {
    const payload = event.payload as {
      dittoHttpState?: 'connecting' | 'live' | 'degraded';
      dittoLiveState?: unknown;
      frontendRealtimeState?: unknown;
      connectionState?: unknown;
      dataState?: unknown;
      lastBootstrapAt?: string;
      lastLiveEventAt?: string;
      activeSessions?: number;
      duplicateEventsDropped?: number;
      outOfOrderEventsRejected?: number;
      outOfScopeEventsRejected?: number;
      malformedEventsRejected?: number;
      lastFailureReason?: string;
    };
    useRealtimeStore.getState().applySynchronizationState({
      dittoHttpState: payload.dittoHttpState,
      dittoLiveState: isConnectionState(payload.dittoLiveState) ? payload.dittoLiveState : undefined,
      frontendRealtimeState: isConnectionState(payload.frontendRealtimeState)
        ? payload.frontendRealtimeState
        : undefined,
      connectionState: isConnectionState(payload.connectionState) ? payload.connectionState : undefined,
      dataState: isDataState(payload.dataState) ? payload.dataState : undefined,
      sceneRuntime:
        isConnectionState(payload.connectionState) && isDataState(payload.dataState)
          ? deriveSceneRuntimeState(
              payload.connectionState,
              payload.dataState,
              Object.keys(useElevatorStore.getState().elevators).length,
              useRealtimeStore.getState().hasWebglSupport
            )
          : undefined,
      projectionCount: Object.keys(useElevatorStore.getState().elevators).length,
      lastBootstrapAt: payload.lastBootstrapAt,
      lastLiveEventAt: payload.lastLiveEventAt,
      activeSessions: typeof payload.activeSessions === 'number' ? payload.activeSessions : undefined,
      duplicateEventsDropped: payload.duplicateEventsDropped,
      outOfOrderEventsRejected: payload.outOfOrderEventsRejected,
      outOfScopeEventsRejected: payload.outOfScopeEventsRejected,
      malformedEventsRejected: payload.malformedEventsRejected,
      staleMessage: payload.lastFailureReason
    });
  }

  if (event.eventType === 'dashboard.resync.required') {
    useRealtimeStore.getState().setConnectionState('resyncing');
    options?.onResyncRequired?.();
  }
}

function isConnectionState(value: unknown): value is RealtimeConnectionState {
  return value === 'connecting' || value === 'live' || value === 'stale' || value === 'degraded' || value === 'resyncing';
}

function isDataState(value: unknown): value is DashboardDataState {
  return value === 'loading' || value === 'ready' || value === 'empty' || value === 'degraded';
}
