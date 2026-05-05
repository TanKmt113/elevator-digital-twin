import React from 'react';
import { ElevatorList } from '../modules/elevator/components/ElevatorList';
import { ElevatorDetailPanel } from '../modules/elevator/components/ElevatorDetailPanel';
import { ElevatorSummaryCards } from '../modules/elevator/components/ElevatorSummaryCards';
import { AlertPanel } from '../modules/alerts/components/AlertPanel';
import { RiskWarningPanel } from '../modules/analytics/components/RiskWarningPanel';
import { TwinScene } from '../modules/twin3d/components/TwinScene';
import { useElevatorStore } from '../store/elevator-store';
import {
  useRealtimeStore,
  type DashboardDataState,
  type RealtimeConnectionState,
  type TwinSceneRuntimeState
} from '../store/realtime-store';
import { useSessionStore } from '../store/session-store';
import { ApiError, fetchElevatorBootstrap } from '../services/api/client';
import { RealtimeClient } from '../services/realtime/ws-client';
import { handleRealtimeEvent } from '../services/realtime/elevator-events';

export const DASHBOARD_SECTION_TITLES = [
  'Operations Dashboard',
  'Fleet Overview',
  'Twin Scene',
  'Alerts',
  'Predictive Warnings'
] as const;

interface BootstrapSynchronizationState {
  bootstrapStatus?: string;
  dittoHttpState?: 'connecting' | 'live' | 'degraded';
  dittoLiveState?: string;
  frontendRealtimeState?: string;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  activeSessions?: number;
  duplicateEventsDropped?: number;
  outOfOrderEventsRejected?: number;
  outOfScopeEventsRejected?: number;
  malformedEventsRejected?: number;
  lastFailureReason?: string;
}

export function deriveAppShellState(
  connectionState: RealtimeConnectionState,
  dataState: DashboardDataState,
  elevatorCount: number
): {
  bannerTone: 'info' | 'warning' | 'critical' | 'neutral';
  title: string;
  message: string;
} {
  if (dataState === 'loading') {
    return {
      bannerTone: 'info',
      title: 'Loading live building state',
      message: 'Waiting for Twin bootstrap and realtime readiness.'
    };
  }

  if (dataState === 'empty' || elevatorCount === 0) {
    return {
      bannerTone: 'neutral',
      title: 'No elevators in active scope',
      message: 'No authorized elevator state is currently available for this dashboard view.'
    };
  }

  if (dataState === 'degraded' || connectionState === 'degraded' || connectionState === 'stale') {
    return {
      bannerTone: 'warning',
      title: 'Live updates are degraded',
      message: 'Showing the last accepted elevator state while synchronization recovers.'
    };
  }

  return {
    bannerTone: 'neutral',
    title: 'Twin synchronization is live',
    message: 'Dashboard projections are tracking the latest accepted operational state.'
  };
}

export function deriveRealtimeStateFromBootstrap(
  synchronization: BootstrapSynchronizationState,
  elevatorCount: number
): {
  connectionState: RealtimeConnectionState;
  dataState: DashboardDataState;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  staleMessage?: string;
} {
  const connectionState =
    synchronization.dittoLiveState === 'live'
      ? 'live'
      : synchronization.dittoLiveState === 'stale'
        ? 'stale'
        : synchronization.dittoLiveState === 'degraded'
          ? 'degraded'
          : 'connecting';

  const dataState =
    synchronization.bootstrapStatus === 'failed' || synchronization.bootstrapStatus === 'partial'
      ? 'degraded'
      : elevatorCount === 0 || synchronization.bootstrapStatus === 'empty'
        ? 'empty'
        : 'ready';

  return {
    connectionState,
    dataState,
    lastBootstrapAt: synchronization.lastBootstrapAt,
    lastLiveEventAt: synchronization.lastLiveEventAt,
    duplicateEventsDropped: synchronization.duplicateEventsDropped ?? 0,
    outOfOrderEventsRejected: synchronization.outOfOrderEventsRejected ?? 0,
    staleMessage: synchronization.lastFailureReason
  };
}

export function deriveSceneRuntimeState(
  connectionState: RealtimeConnectionState,
  dataState: DashboardDataState,
  projectionCount: number,
  hasWebglSupport = true
): TwinSceneRuntimeState {
  if (!hasWebglSupport) {
    return 'unavailable';
  }

  if (dataState === 'loading') {
    return 'loading';
  }

  if (dataState === 'empty' || projectionCount === 0) {
    return 'empty';
  }

  if (connectionState === 'stale' || connectionState === 'resyncing') {
    return 'stale';
  }

  if (dataState === 'degraded' || connectionState === 'degraded') {
    return 'degraded';
  }

  return 'ready';
}

export function App(): React.JSX.Element {
  const realtimeClientRef = React.useRef<RealtimeClient | null>(null);
  const elevatorRecord = useElevatorStore((state) => state.elevators);
  const selectedBuildingId = useElevatorStore((state) => state.selectedBuildingId);
  const connectionState = useRealtimeStore((state) => state.connectionState);
  const dataState = useRealtimeStore((state) => state.dataState);
  const staleMessage = useRealtimeStore((state) => state.staleMessage);
  const hasWebglSupport = useRealtimeStore((state) => state.hasWebglSupport);
  const selectedElevatorId = useElevatorStore((state) => state.selectedElevatorId);
  const token = useSessionStore((state) => state.token);
  const elevators = React.useMemo(() => Object.values(elevatorRecord), [elevatorRecord]);
  const shellState = deriveAppShellState(connectionState, dataState, elevators.length);
  const featuredElevator =
    elevators.find((elevator) => elevator.elevatorId === selectedElevatorId) ?? elevators[0];
  const toneClasses = {
    info: 'border-sky-400/30 bg-sky-400/10 text-sky-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-50',
    critical: 'border-rose-400/30 bg-rose-400/10 text-rose-50',
    neutral: 'border-white/10 bg-white/5 text-slate-100'
  } as const;

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
              ? 'Backend requires an operator token for elevator bootstrap.'
              : error.status === 403
                ? 'Current token does not have access to the selected building.'
                : error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load elevator bootstrap from backend.';

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
  }, [hydrateBootstrap, selectedBuildingId]);

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

  return (
    <main className="ops-shell mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="ops-topbar flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ops-kicker text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
            {DASHBOARD_SECTION_TITLES[0]}
          </p>
          <h1 className="ops-title text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            Keangnam Smart Building Operations
          </h1>
        </div>
        <div className="ops-scope-pill rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {elevators.length} elevators in active scope
        </div>
      </section>
      <section className={`ops-sync ops-sync-${shellState.bannerTone} rounded-2xl border px-4 py-3 shadow-sm ${toneClasses[shellState.bannerTone]}`}>
        <p className="ops-label text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Synchronization
        </p>
        <h2 className="ops-sync-title mt-1 text-lg font-semibold">{shellState.title}</h2>
        <p className="ops-muted mt-1 text-sm text-white/80">{staleMessage ?? shellState.message}</p>
      </section>
      <ElevatorSummaryCards />
      <section className="ops-main-grid grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="ops-column grid gap-6">
          <ElevatorList />
          <TwinScene />
        </div>
        <div className="ops-column grid gap-6">
          {featuredElevator ? <ElevatorDetailPanel elevator={featuredElevator} /> : null}
          <AlertPanel />
          <RiskWarningPanel />
        </div>
      </section>
    </main>
  );
}
