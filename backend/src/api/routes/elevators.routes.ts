import { Router } from 'express';
import { authenticateJwt } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { ElevatorMonitoringService } from '../../modules/elevators/elevator-monitoring.service.js';

export function createElevatorRoutes(service: ElevatorMonitoringService): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('operator', 'admin', 'maintenance'));

  router.get('/elevators', (req, res) => {
    const buildingId = typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined;
    if (!buildingId) {
      res.status(400).json({ code: 'BUILDING_ID_REQUIRED', message: 'buildingId query parameter is required' });
      return;
    }
    res.json({
      items: service.listByBuilding(buildingId),
      meta: {
        synchronization: service.getSynchronizationState()
      }
    });
  });

  router.get('/elevators/:elevatorId', (req, res) => {
    const buildingId = typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined;
    if (!buildingId) {
      res.status(400).json({ code: 'BUILDING_ID_REQUIRED', message: 'buildingId query parameter is required' });
      return;
    }
    const twin = service.get(req.params.elevatorId);
    if (!twin || twin.buildingId !== buildingId) {
      res.status(404).json({ code: 'ELEVATOR_NOT_FOUND', message: 'Elevator not found' });
      return;
    }
    res.json(twin);
  });

  return router;
}
