import type { JwtPayload } from 'jsonwebtoken';

export type CanonicalRole = 'platform_admin' | 'building_admin' | 'operator' | 'viewer';

export interface AuthPrincipal {
  userId: string;
  email?: string;
  roles: CanonicalRole[];
  buildings: string[];
  isPlatformAdmin: boolean;
}

export interface AuthUserContext {
  userId: string;
  email?: string;
  role: string;
  buildingId: string;
  buildingIds: string[];
  isPlatformAdmin: boolean;
}

/** Maps legacy dev JWT role names to contract roles. */
export function canonicalizeRole(role: string): CanonicalRole {
  const r = role.toLowerCase();
  if (r === 'admin') return 'platform_admin';
  if (r === 'maintenance') return 'operator';
  if (r === 'platform_admin' || r === 'building_admin' || r === 'operator' || r === 'viewer') {
    return r;
  }
  return 'operator';
}

export function normalizeJwtPayload(payload: string | JwtPayload): AuthPrincipal {
  const p = typeof payload === 'string' ? ({} as JwtPayload) : payload;
  const userId =
    typeof p.sub === 'string' && p.sub.length > 0
      ? p.sub
      : typeof (p as { userId?: unknown }).userId === 'string'
        ? (p as { userId: string }).userId
        : '';
  const email = typeof p.email === 'string' ? p.email : undefined;
  const rawRoles: string[] = [];
  if (Array.isArray((p as { roles?: unknown }).roles)) {
    for (const entry of (p as { roles: unknown[] }).roles) {
      if (typeof entry === 'string') rawRoles.push(entry);
    }
  }
  if (typeof (p as { role?: unknown }).role === 'string') {
    rawRoles.push((p as { role: string }).role);
  }
  const roles = [...new Set(rawRoles.map(canonicalizeRole))];
  const buildings: string[] = [];
  if (Array.isArray((p as { buildings?: unknown }).buildings)) {
    for (const b of (p as { buildings: unknown[] }).buildings) {
      if (typeof b === 'string' && b.length > 0) buildings.push(b);
    }
  }
  if (typeof (p as { buildingId?: unknown }).buildingId === 'string' && (p as { buildingId: string }).buildingId) {
    buildings.push((p as { buildingId: string }).buildingId);
  }
  const uniqueBuildings = [...new Set(buildings)];
  const isPlatformAdmin = roles.includes('platform_admin');
  return { userId, email, roles, buildings: uniqueBuildings, isPlatformAdmin };
}

export function principalToUserContext(principal: AuthPrincipal): AuthUserContext {
  const primaryRole = principal.roles[0] ?? 'operator';
  const buildingId = principal.isPlatformAdmin
    ? principal.buildings[0] ?? ''
    : principal.buildings[0] ?? '';
  return {
    userId: principal.userId,
    email: principal.email,
    role: primaryRole,
    buildingId,
    buildingIds: principal.buildings,
    isPlatformAdmin: principal.isPlatformAdmin
  };
}
