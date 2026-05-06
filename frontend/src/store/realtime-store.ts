import { create } from 'zustand';

export type RealtimeConnectionState =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'degraded'
  | 'resyncing';

export type DashboardDataState = 'loading' | 'ready' | 'empty' | 'degraded';
export type TwinSceneRuntimeState =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'stale'
  | 'degraded'
  | 'unavailable';

interface RealtimeState {
  connected: boolean;
  connectionState: RealtimeConnectionState;
  dataState: DashboardDataState;
  dittoHttpState?: 'connecting' | 'live' | 'degraded';
  dittoLiveState?: RealtimeConnectionState;
  frontendRealtimeState?: RealtimeConnectionState;
  sceneRuntime: TwinSceneRuntimeState;
  projectionCount: number;
  hasWebglSupport: boolean;
  webglMessage?: string;
  projectionFailures: number;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  activeSessions: number;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  outOfScopeEventsRejected: number;
  malformedEventsRejected: number;
  staleMessage?: string;
  setConnectionState: (connectionState: RealtimeConnectionState) => void;
  setDataState: (dataState: DashboardDataState) => void;
  setConnected: (connected: boolean) => void;
  setStaleMessage: (message?: string) => void;
  setSceneRuntime: (sceneRuntime: TwinSceneRuntimeState, projectionCount?: number) => void;
  setWebglCapability: (hasWebglSupport: boolean, webglMessage?: string) => void;
  setProjectionFailures: (projectionFailures: number) => void;
  applySynchronizationState: (state: Partial<Omit<RealtimeState, 'applySynchronizationState'>>) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  connectionState: 'connecting',
  dataState: 'loading',
  dittoHttpState: 'connecting',
  dittoLiveState: 'connecting',
  frontendRealtimeState: 'connecting',
  sceneRuntime: 'loading',
  projectionCount: 0,
  hasWebglSupport: true,
  webglMessage: undefined,
  projectionFailures: 0,
  lastBootstrapAt: undefined,
  lastLiveEventAt: undefined,
  activeSessions: 0,
  duplicateEventsDropped: 0,
  outOfOrderEventsRejected: 0,
  outOfScopeEventsRejected: 0,
  malformedEventsRejected: 0,
  staleMessage: undefined,
  setConnectionState: (connectionState) =>
    set({
      connectionState,
      connected: connectionState === 'live'
    }),
  setDataState: (dataState) => set({ dataState }),
  setConnected: (connected) =>
    set({
      connected,
      connectionState: connected ? 'live' : 'connecting'
    }),
  setStaleMessage: (staleMessage) => set({ staleMessage }),
  setSceneRuntime: (sceneRuntime, projectionCount = 0) => set({ sceneRuntime, projectionCount }),
  setWebglCapability: (hasWebglSupport, webglMessage) => set({ hasWebglSupport, webglMessage }),
  setProjectionFailures: (projectionFailures) => set({ projectionFailures }),
  applySynchronizationState: (state) =>
    set((current) => ({
      ...current,
      ...state,
      connected: state.connectionState ? state.connectionState === 'live' : current.connected
    }))
}));
