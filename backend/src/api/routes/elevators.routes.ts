import { Router } from 'express';
import { authenticateJwt } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { ElevatorMonitoringService } from '../../modules/elevators/elevator-monitoring.service.js';

export function createElevatorRoutes(service: ElevatorMonitoringService): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('operator', 'admin', 'maintenance'));

  router.get('/elevators', (_req, res) => {
    res.json({ items: service.list() });
  });

  router.get('/elevators/:elevatorId', (req, res) => {
    const twin = service.get(req.params.elevatorId);
    if (!twin) {
      res.status(404).json({ code: 'ELEVATOR_NOT_FOUND', message: 'Elevator not found' });
      return;
    }
    res.json(twin);
  });

  return router;
}
