import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.middleware.js';
import { canonicalizeRole, type CanonicalRole } from './auth.types.js';

/** Legacy route names still accepted on tokens after canonicalization. */
function expandRoleNames(allowed: string[]): Set<CanonicalRole> {
  const out = new Set<CanonicalRole>();
  for (const name of allowed) {
    out.add(canonicalizeRole(name));
  }
  return out;
}

export function requireRoles(...allowed: string[]) {
  const allowedSet = expandRoleNames(allowed);
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.principal?.roles.length) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Insufficient role scope' });
      return;
    }
    const ok = req.principal.roles.some((r) => allowedSet.has(r));
    if (!ok) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Insufficient role scope' });
      return;
    }
    next();
  };
}

export function requirePlatformAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.principal?.isPlatformAdmin) {
    res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Insufficient role for user administration'
    });
    return;
  }
  next();
}

export function requireThingProvisioningRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const ok =
    req.principal?.isPlatformAdmin ||
    Boolean(req.principal?.roles.includes('building_admin'));
  if (!ok) {
    res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Insufficient role for Thing provisioning'
    });
    return;
  }
  next();
}
