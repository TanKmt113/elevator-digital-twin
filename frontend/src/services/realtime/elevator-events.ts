import type { ElevatorViewModel } from '../../store/elevator-store';
import { useElevatorStore } from '../../store/elevator-store';
import type { RiskWarningViewModel } from '../../store/risk-store';
import { useRiskStore } from '../../store/risk-store';
import {
  useRealtimeStore,
  type DashboardDataState,
  type RealtimeConnectionState
} from '../../store/realtime-store';
import { deriveSceneRuntimeState } from '../../app/App';

interface ElevatorStateEnvelope {
  eventId?: string;
  eventType: string;
  payload: unknown;
}

const seenRealtimeEventIds = new Set<string>();

function rememberRealtimeEvent(eventId: string): boolean {
  if (seenRealtimeEventIds.has(eventId)) {
    return false;
  }

  seenRealtimeEventIds.add(eventId);
  if (seenRealtimeEventIds.size > 200) {
    const oldest = seenRealtimeEventIds.values().next().value;
    if (oldest) {
      seenRealtimeEventIds.delete(oldest);
    }
  }

  return true;
}

export function handleRealtimeEvent(
  event: ElevatorStateEnvelope,
  options?: { onResyncRequired?: () => void }
): void {
  if (event.eventType === 'elevator.state.changed') {
    if (event.eventId && !rememberRealtimeEvent(event.eventId)) {
      return;
    }
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

  if (event.eventType === 'elevator.risk.updated') {
    if (event.eventId && !rememberRealtimeEvent(event.eventId)) {
      return;
    }
    useRiskStore.getState().upsertWarning(event.payload as RiskWarningViewModel);
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
      hydrationFailures?: number;
      normalizationFailures?: number;
      commandPolicyRejections?: number;
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
      hydrationFailures: payload.hydrationFailures,
      normalizationFailures: payload.normalizationFailures,
      commandPolicyRejections: payload.commandPolicyRejections,
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
