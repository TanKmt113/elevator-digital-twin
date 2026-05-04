import { Router } from 'express';
import { authenticateJwt } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { ElevatorHistoryService } from '../../modules/elevators/elevator-history.service.js';

export function createElevatorHistoryRoutes(service: ElevatorHistoryService): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('admin', 'maintenance', 'operator'));

  router.get('/elevators/:elevatorId/history', (req, res) => {
    const from = String(req.query.from ?? '');
    const to = String(req.query.to ?? '');
    res.json({ items: service.query(req.params.elevatorId, from, to) });
  });

  return router;
}
