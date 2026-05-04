import { create } from 'zustand';

export type RealtimeConnectionState =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'degraded'
  | 'resyncing';

export type DashboardDataState = 'loading' | 'ready' | 'empty' | 'degraded';

interface RealtimeState {
  connected: boolean;
  connectionState: RealtimeConnectionState;
  dataState: DashboardDataState;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  staleMessage?: string;
  setConnectionState: (connectionState: RealtimeConnectionState) => void;
  setDataState: (dataState: DashboardDataState) => void;
  setConnected: (connected: boolean) => void;
  setStaleMessage: (message?: string) => void;
  applySynchronizationState: (state: Partial<Omit<RealtimeState, 'applySynchronizationState'>>) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  connectionState: 'connecting',
  dataState: 'loading',
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
  applySynchronizationState: (state) =>
    set((current) => ({
      ...current,
      ...state,
      connected: state.connectionState ? state.connectionState === 'live' : current.connected
    }))
}));
