import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { settings } from '../../config/settings.js';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: string; buildingId: string };
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Bearer token required' });
    return;
  }

  try {
    req.user = jwt.verify(header.slice(7), settings.env.jwtSecret) as AuthenticatedRequest['user'];
    next();
  } catch {
    res.status(401).json({ code: 'AUTH_INVALID', message: 'Invalid token' });
  }
}
