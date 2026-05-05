import { create } from 'zustand';

interface SessionState {
  token?: string;
  role?: string;
  setSession: (token: string, role: string) => void;
}

function getInitialSession() {
  return {
    token: import.meta.env.VITE_OPERATOR_TOKEN,
    role: import.meta.env.VITE_OPERATOR_ROLE ?? 'operator'
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...getInitialSession(),
  setSession: (token, role) => set({ token, role })
}));
