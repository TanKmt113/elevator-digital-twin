import { create } from 'zustand';

interface SessionState {
  token?: string;
  role?: string;
  setSession: (token: string, role: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  token: undefined,
  role: undefined,
  setSession: (token, role) => set({ token, role })
}));
