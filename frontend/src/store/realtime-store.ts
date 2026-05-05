import { create } from 'zustand';

export type RealtimeConnectionState =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'degraded'
  | 'resyncing';

export type DashboardDataState = 'loading' | 'ready' | 'empty' | 'degraded';
export type TwinSceneRuntimeState = 'loading' | 'ready' | 'empty' | 'stale' | 'degraded';

interface RealtimeState {
  connected: boolean;
  connectionState: RealtimeConnectionState;
  dataState: DashboardDataState;
  sceneRuntime: TwinSceneRuntimeState;
  projectionCount: number;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  staleMessage?: string;
  setConnectionState: (connectionState: RealtimeConnectionState) => void;
  setDataState: (dataState: DashboardDataState) => void;
  setConnected: (connected: boolean) => void;
  setStaleMessage: (message?: string) => void;
  setSceneRuntime: (sceneRuntime: TwinSceneRuntimeState, projectionCount?: number) => void;
  applySynchronizationState: (state: Partial<Omit<RealtimeState, 'applySynchronizationState'>>) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  connectionState: 'connecting',
  dataState: 'loading',
  sceneRuntime: 'loading',
  projectionCount: 0,
  lastBootstrapAt: undefined,
  lastLiveEventAt: undefined,
  duplicateEventsDropped: 0,
  outOfOrderEventsRejected: 0,
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
  applySynchronizationState: (state) =>
    set((current) => ({
      ...current,
      ...state,
      connected: state.connectionState ? state.connectionState === 'live' : current.connected
    }))
}));
