import { Router } from 'express';
import { authenticateJwt, hasBuildingScope } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { ElevatorHistoryService } from '../../modules/elevators/elevator-history.service.js';

export function createElevatorHistoryRoutes(service: ElevatorHistoryService): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('admin', 'maintenance', 'operator'));

  router.get('/elevators/:elevatorId/history', (req, res) => {
    const buildingId = typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined;
    const from = String(req.query.from ?? '');
    const to = String(req.query.to ?? '');
    const resolution = typeof req.query.resolution === 'string' ? req.query.resolution : '1s';

    if (!buildingId) {
      res.status(400).json({ code: 'BUILDING_ID_REQUIRED', message: 'buildingId query parameter is required' });
      return;
    }
    if (!hasBuildingScope(req, buildingId)) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Building scope is forbidden' });
      return;
    }

    res.json(service.queryPlayback(req.params.elevatorId, buildingId, from, to, resolution));
  });

  return router;
}
