import { create } from 'zustand';

interface SessionState {
  token?: string;
  role?: string;
  setSession: (token: string, role: string) => void;
}

export function isJwtExpired(token: string | undefined, nowMs = Date.now()): boolean {
  if (!token) {
    return true;
  }

  const [, payload] = token.split('.');
  if (!payload) {
    return true;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { exp?: unknown };
    return typeof decoded.exp !== 'number' || decoded.exp * 1000 <= nowMs + 30_000;
  } catch {
    return true;
  }
}

function getInitialSession() {
  const token = import.meta.env.VITE_OPERATOR_TOKEN;

  return {
    token: isJwtExpired(token) ? undefined : token,
    role: import.meta.env.VITE_OPERATOR_ROLE ?? 'operator'
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...getInitialSession(),
  setSession: (token, role) => set({ token, role })
}));
