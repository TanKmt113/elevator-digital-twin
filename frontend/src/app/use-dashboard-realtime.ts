import React from 'react';
import { ApiError, fetchElevatorBootstrap } from '../services/api/client';
import { handleRealtimeEvent } from '../services/realtime/elevator-events';
import { RealtimeClient } from '../services/realtime/ws-client';
import { useElevatorStore, type ElevatorViewModel } from '../store/elevator-store';
import { useRealtimeStore } from '../store/realtime-store';
import { useSessionStore } from '../store/session-store';
import {
  deriveAppShellState,
  deriveRealtimeStateFromBootstrap,
  deriveSceneRuntimeState
} from './dashboard-state';

export function useDashboardRealtime(): {
  elevators: ElevatorViewModel[];
  role?: string;
  selectedBuildingId: string;
  shellState: ReturnType<typeof deriveAppShellState>;
  staleMessage?: string;
} {
  const realtimeClientRef = React.useRef<RealtimeClient | null>(null);
  const elevatorRecord = useElevatorStore((state) => state.elevators);
  const selectedBuildingId = useElevatorStore((state) => state.selectedBuildingId);
  const connectionState = useRealtimeStore((state) => state.connectionState);
  const dataState = useRealtimeStore((state) => state.dataState);
  const staleMessage = useRealtimeStore((state) => state.staleMessage);
  const hasWebglSupport = useRealtimeStore((state) => state.hasWebglSupport);
  const token = useSessionStore((state) => state.token);
  const role = useSessionStore((state) => state.role);
  const elevators = React.useMemo(() => Object.values(elevatorRecord), [elevatorRecord]);
  const shellState = deriveAppShellState(connectionState, dataState, elevators.length);
  const hydrateBootstrap = React.useCallback(async () => {
    const response = await fetchElevatorBootstrap(selectedBuildingId, token);
    useElevatorStore.getState().replaceElevators(response.items, selectedBuildingId);
    const realtimeState = deriveRealtimeStateFromBootstrap(
      response.meta.synchronization,
      response.items.length
    );

    useRealtimeStore.getState().applySynchronizationState({
      ...realtimeState,
      dittoHttpState: response.meta.synchronization.dittoHttpState,
      dittoLiveState:
        response.meta.synchronization.dittoLiveState === 'connecting' ||
        response.meta.synchronization.dittoLiveState === 'live' ||
        response.meta.synchronization.dittoLiveState === 'stale' ||
        response.meta.synchronization.dittoLiveState === 'degraded' ||
        response.meta.synchronization.dittoLiveState === 'resyncing'
          ? response.meta.synchronization.dittoLiveState
          : undefined,
      frontendRealtimeState:
        response.meta.synchronization.frontendRealtimeState === 'connecting' ||
        response.meta.synchronization.frontendRealtimeState === 'live' ||
        response.meta.synchronization.frontendRealtimeState === 'stale' ||
        response.meta.synchronization.frontendRealtimeState === 'degraded' ||
        response.meta.synchronization.frontendRealtimeState === 'resyncing'
          ? response.meta.synchronization.frontendRealtimeState
          : undefined,
      activeSessions: response.meta.synchronization.activeSessions,
      outOfScopeEventsRejected: response.meta.synchronization.outOfScopeEventsRejected,
      malformedEventsRejected: response.meta.synchronization.malformedEventsRejected,
      sceneRuntime: deriveSceneRuntimeState(
        realtimeState.connectionState,
        realtimeState.dataState,
        response.items.length,
        hasWebglSupport
      ),
      projectionCount: response.items.length
    });
    return response;
  }, [hasWebglSupport, selectedBuildingId, token]);

  React.useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    useRealtimeStore.getState().setDataState('loading');
    useRealtimeStore.getState().setConnectionState('connecting');
    useRealtimeStore.getState().setStaleMessage(undefined);

    void hydrateBootstrap()
      .then(() => {
        if (cancelled) {
          return;
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof ApiError
            ? error.status === 401
              ? 'Backend yêu cầu token vận hành để tải dữ liệu thang máy.'
              : error.status === 403
                ? 'Token hiện tại không có quyền truy cập tòa nhà đã chọn.'
                : error.message
            : error instanceof Error
              ? error.message
              : 'Không thể tải dữ liệu thang máy từ backend.';

        useElevatorStore.getState().replaceElevators([], selectedBuildingId);
        useRealtimeStore.getState().applySynchronizationState({
          connectionState: 'degraded',
          dataState: 'degraded',
          staleMessage: message,
          sceneRuntime: 'degraded',
          projectionCount: 0
        });
      });

    return () => {
      cancelled = true;
    };
  }, [hydrateBootstrap, selectedBuildingId, token]);

  React.useEffect(() => {
    if (!token) {
      return;
    }

    const realtimeClient = new RealtimeClient();
    realtimeClientRef.current = realtimeClient;

    const disposeMessage = realtimeClient.onMessage((payload) => {
      handleRealtimeEvent(payload as Parameters<typeof handleRealtimeEvent>[0], {
        onResyncRequired: () => {
          void hydrateBootstrap().catch(() => {
            useRealtimeStore.getState().setConnectionState('degraded');
          });
        }
      });
    });
    const disposeConnection = realtimeClient.onConnectionState((state) => {
      useRealtimeStore.getState().setConnectionState(state);
    });

    realtimeClient.connect(selectedBuildingId, token);

    return () => {
      disposeMessage();
      disposeConnection();
      realtimeClient.disconnect();
      realtimeClientRef.current = null;
    };
  }, [hydrateBootstrap, selectedBuildingId, token]);

  return {
    elevators,
    role,
    selectedBuildingId,
    shellState,
    staleMessage
  };
}
