import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { settings } from '../../config/settings.js';

const allowedRoles = new Set(['operator', 'admin', 'maintenance']);

interface DevAuthRequestBody {
  userId?: unknown;
  buildingId?: unknown;
  role?: unknown;
}

export function createDevAuthRoutes(): Router {
  const router = Router();

  router.post('/dev/auth/operator-token', (req, res) => {
    if (!settings.env.devAuthEnabled || process.env.NODE_ENV === 'production') {
      res.status(404).json({ code: 'DEV_AUTH_DISABLED', message: 'Developer auth is disabled' });
      return;
    }

    const body = (req.body ?? {}) as DevAuthRequestBody;
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const buildingId = typeof body.buildingId === 'string' ? body.buildingId.trim() : '';
    const role = typeof body.role === 'string' ? body.role : 'operator';

    if (!userId || !buildingId) {
      res.status(400).json({
        code: 'INVALID_DEV_AUTH_REQUEST',
        message: 'userId and buildingId are required'
      });
      return;
    }

    if (!allowedRoles.has(role)) {
      res.status(400).json({
        code: 'INVALID_DEV_AUTH_ROLE',
        message: 'role must be one of operator, admin, maintenance'
      });
      return;
    }

    const token = jwt.sign(
      {
        userId,
        buildingId,
        role
      },
      settings.env.jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role,
      buildingId,
      tokenType: 'Bearer',
      expiresIn: '1d'
    });
  });

  return router;
}
