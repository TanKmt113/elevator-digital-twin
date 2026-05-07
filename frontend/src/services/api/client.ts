import type { ElevatorViewModel } from '../../store/elevator-store';
import type { RiskWarningViewModel } from '../../store/risk-store';

interface SynchronizationHealth {
  bootstrapStatus?: string;
  dittoHttpState?: 'connecting' | 'live' | 'degraded';
  dittoLiveState?: 'connecting' | 'live' | 'stale' | 'degraded' | 'resyncing';
  frontendRealtimeState?: 'connecting' | 'live' | 'stale' | 'degraded' | 'resyncing';
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  activeSessions?: number;
  duplicateEventsDropped?: number;
  outOfOrderEventsRejected?: number;
  outOfScopeEventsRejected?: number;
  malformedEventsRejected?: number;
  lastFailureReason?: string;
}

export interface ElevatorBootstrapResponse {
  items: ElevatorViewModel[];
  meta: {
    synchronization: SynchronizationHealth;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown
  ) {
    super(message);
  }
}

export interface DevOperatorTokenResponse {
  token: string;
  role: string;
  buildingId: string;
  tokenType: string;
  expiresIn: string;
}

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    const message = extractErrorMessage(payload, response.status);
    throw new ApiError(message, response.status, payload);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    const message = extractErrorMessage(payload, response.status);
    throw new ApiError(message, response.status, payload);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    throw new ApiError(extractErrorMessage(payload, response.status), response.status, payload);
  }

  return response.json() as Promise<T>;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === 'object' &&
    payload &&
    'error' in payload &&
    typeof payload.error === 'object' &&
    payload.error &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message;
  }
  if (typeof payload === 'object' && payload && 'message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }
  return `Request failed with status ${status}`;
}

export async function fetchElevatorBootstrap(
  buildingId: string,
  token?: string
): Promise<ElevatorBootstrapResponse> {
  const query = new URLSearchParams({ buildingId });
  return apiGet<ElevatorBootstrapResponse>(`/elevators?${query.toString()}`, token);
}

export async function fetchRiskWarnings(token?: string): Promise<{ items: RiskWarningViewModel[] }> {
  return apiGet<{ items: RiskWarningViewModel[] }>('/analytics/risk', token);
}

export async function requestDevOperatorToken(
  buildingId: string,
  role = 'operator',
  userId = 'operator-local'
): Promise<DevOperatorTokenResponse> {
  return apiPost<DevOperatorTokenResponse>('/dev/auth/operator-token', {
    userId,
    buildingId,
    role
  });
}
