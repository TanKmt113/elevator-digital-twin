import { create } from 'zustand';

interface SessionState {
  token?: string;
  role?: string;
  roles: string[];
  email?: string;
  setSession: (token: string, role: string, roles?: string[]) => void;
  clearSession: () => void;
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
  if (
    typeof localStorage === 'undefined' ||
    typeof localStorage.getItem !== 'function' ||
    typeof localStorage.removeItem !== 'function'
  ) {
    return {
      token: undefined,
      role: undefined,
      roles: [],
      email: undefined
    };
  }
  const stored = localStorage.getItem('keangnam.session');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as {
        token?: unknown;
        role?: unknown;
        roles?: unknown;
        email?: unknown;
      };
      const token = typeof parsed.token === 'string' ? parsed.token : undefined;
      const roles = Array.isArray(parsed.roles)
        ? parsed.roles.filter((item): item is string => typeof item === 'string')
        : [];
      if (!isJwtExpired(token)) {
        return {
          token,
          role: typeof parsed.role === 'string' ? parsed.role : 'operator',
          roles,
          email: typeof parsed.email === 'string' ? parsed.email : undefined
        };
      }
    } catch {
      localStorage.removeItem('keangnam.session');
    }
  }

  return {
    token: undefined,
    role: undefined,
    roles: [],
    email: undefined
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...getInitialSession(),
  setSession: (token, role, roles = [role]) => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem('keangnam.session', JSON.stringify({ token, role, roles }));
    }
    set({ token, role, roles });
  },
  clearSession: () => {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem('keangnam.session');
    }
    set({ token: undefined, role: undefined, roles: [], email: undefined });
  }
}));
