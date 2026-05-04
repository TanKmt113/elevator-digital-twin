import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.middleware.js';

export function requireRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Insufficient role scope' });
      return;
    }
    next();
  };
}
