import { apiGet, apiPatch, apiPost } from '../../../services/api/client';
import { requestDevOperatorToken } from '../../../services/api/client';

export type AdminRole = 'platform_admin' | 'building_admin' | 'operator' | 'viewer';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: null | { code: string; message: string };
}

export interface LoginResult {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: {
    userId: string;
    email: string;
    roles: AdminRole[];
    buildings: string[];
  };
}

export interface AdminUser {
  userId: string;
  email: string;
  status: string;
  roles: AdminRole[];
  buildings: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminThingResult {
  thingId: string;
  buildingId: string;
  created?: boolean;
  updated?: boolean;
  archived?: boolean;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const body = await apiPost<ApiEnvelope<LoginResult>>('/api/v1/auth/login', { email, password });
  return body.data;
}

export async function requestDevAdminSession(buildingId: string): Promise<LoginResult> {
  const dev = await requestDevOperatorToken(buildingId, 'admin', 'admin-local');
  return {
    token: dev.token,
    tokenType: dev.tokenType,
    expiresIn: dev.expiresIn,
    user: {
      userId: 'admin-local',
      email: 'admin-local@dev.local',
      roles: ['platform_admin'],
      buildings: [buildingId]
    }
  };
}

export async function listAdminUsers(token: string): Promise<AdminUser[]> {
  const body = await apiGet<ApiEnvelope<{ items: AdminUser[] }>>('/api/v1/admin/users', token);
  return body.data.items;
}

export async function createAdminUser(
  token: string,
  input: { email: string; password: string; roles: AdminRole[]; buildingIds: string[] }
): Promise<AdminUser> {
  const body = await apiPost<ApiEnvelope<AdminUser>>('/api/v1/admin/users', input, token);
  return body.data;
}

export async function createElevatorThing(
  token: string,
  input: { buildingId: string; thingId: string; shaftId: string; policyId?: string }
): Promise<AdminThingResult> {
  const body = await apiPost<ApiEnvelope<AdminThingResult>>(
    `/api/v1/buildings/${encodeURIComponent(input.buildingId)}/elevators/things`,
    {
      thingId: input.thingId,
      shaftId: input.shaftId,
      policyId: input.policyId || undefined
    },
    token
  );
  return body.data;
}

export async function patchElevatorThing(
  token: string,
  input: { buildingId: string; thingId: string; properties: Record<string, unknown> }
): Promise<AdminThingResult> {
  const body = await apiPatch<ApiEnvelope<AdminThingResult>>(
    `/api/v1/buildings/${encodeURIComponent(input.buildingId)}/elevators/things/${encodeURIComponent(input.thingId)}`,
    { properties: input.properties },
    token
  );
  return body.data;
}

export async function archiveElevatorThing(
  token: string,
  input: { buildingId: string; thingId: string }
): Promise<AdminThingResult> {
  const body = await apiPost<ApiEnvelope<AdminThingResult>>(
    `/api/v1/buildings/${encodeURIComponent(input.buildingId)}/elevators/things/${encodeURIComponent(input.thingId)}/archive`,
    {},
    token
  );
  return body.data;
}
