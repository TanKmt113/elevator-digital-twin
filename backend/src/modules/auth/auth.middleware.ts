import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { settings } from '../../config/settings.js';
import {
  normalizeJwtPayload,
  principalToUserContext,
  type AuthPrincipal,
  type AuthUserContext
} from './auth.types.js';

export interface AuthenticatedRequest extends Request {
  principal?: AuthPrincipal;
  user?: AuthUserContext;
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Bearer token required' });
    return;
  }

  try {
    const decoded = jwt.verify(header.slice(7), settings.env.jwtSecret) as string | JwtPayload;
    if (typeof decoded === 'string') {
      res.status(401).json({ code: 'AUTH_INVALID', message: 'Invalid token' });
      return;
    }
    const principal = normalizeJwtPayload(decoded);
    if (!principal.userId) {
      res.status(401).json({ code: 'AUTH_INVALID', message: 'Invalid token subject' });
      return;
    }
    req.principal = principal;
    req.user = principalToUserContext(principal);
    next();
  } catch {
    res.status(401).json({ code: 'AUTH_INVALID', message: 'Invalid token' });
  }
}

export function hasBuildingScope(req: AuthenticatedRequest, buildingId: string | undefined): boolean {
  if (!buildingId || !req.principal) {
    return false;
  }
  if (req.principal.isPlatformAdmin) {
    return true;
  }
  return req.principal.buildings.includes(buildingId);
}
