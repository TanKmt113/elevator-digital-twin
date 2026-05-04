import { create } from 'zustand';

interface RealtimeState {
  connected: boolean;
  staleMessage?: string;
  setConnected: (connected: boolean) => void;
  setStaleMessage: (message?: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  staleMessage: undefined,
  setConnected: (connected) => set({ connected }),
  setStaleMessage: (staleMessage) => set({ staleMessage })
}));
