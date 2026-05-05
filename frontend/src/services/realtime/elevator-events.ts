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

export function handleRealtimeEvent(event: ElevatorStateEnvelope): void {
  if (event.eventType === 'elevator.state.changed') {
    useElevatorStore.getState().upsertElevator(event.payload as ElevatorViewModel);
    useRealtimeStore.getState().setConnected(true);
    useRealtimeStore.getState().setDataState('ready');
    const projectionCount = Object.keys(useElevatorStore.getState().elevators).length;
    useRealtimeStore.getState().setSceneRuntime('ready', projectionCount);
  }

  if (event.eventType === 'system.connection.state') {
    const payload = event.payload as {
      connectionState?: unknown;
      dataState?: unknown;
      lastBootstrapAt?: string;
      lastLiveEventAt?: string;
      duplicateEventsDropped?: number;
      outOfOrderEventsRejected?: number;
      lastFailureReason?: string;
    };
    useRealtimeStore.getState().applySynchronizationState({
      connectionState: isConnectionState(payload.connectionState) ? payload.connectionState : undefined,
      dataState: isDataState(payload.dataState) ? payload.dataState : undefined,
      sceneRuntime:
        isConnectionState(payload.connectionState) && isDataState(payload.dataState)
          ? deriveSceneRuntimeState(
              payload.connectionState,
              payload.dataState,
              Object.keys(useElevatorStore.getState().elevators).length
            )
          : undefined,
      projectionCount: Object.keys(useElevatorStore.getState().elevators).length,
      lastBootstrapAt: payload.lastBootstrapAt,
      lastLiveEventAt: payload.lastLiveEventAt,
      duplicateEventsDropped: payload.duplicateEventsDropped,
      outOfOrderEventsRejected: payload.outOfOrderEventsRejected,
      staleMessage: payload.lastFailureReason
    });
  }
}

function isConnectionState(value: unknown): value is RealtimeConnectionState {
  return value === 'connecting' || value === 'live' || value === 'stale' || value === 'degraded' || value === 'resyncing';
}

function isDataState(value: unknown): value is DashboardDataState {
  return value === 'loading' || value === 'ready' || value === 'empty' || value === 'degraded';
}
