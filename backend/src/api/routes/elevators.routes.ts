import { Router } from 'express';
import { authenticateJwt, hasBuildingScope } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { ElevatorMonitoringService } from '../../modules/elevators/elevator-monitoring.service.js';
import type { RealtimeSynchronizationState } from '../../contracts/elevator.js';

export function createElevatorRoutes(
  service: ElevatorMonitoringService,
  getSynchronizationState: () => RealtimeSynchronizationState = () => service.getSynchronizationState()
): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('operator', 'admin', 'maintenance'));

  router.get('/elevators', async (req, res) => {
    const buildingId = typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined;
    if (!buildingId) {
      res.status(400).json({ code: 'BUILDING_ID_REQUIRED', message: 'buildingId query parameter is required' });
      return;
    }
    if (!hasBuildingScope(req, buildingId)) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Building scope is forbidden' });
      return;
    }

    await service.refreshFromDitto().catch(() => undefined);
    res.json({
      items: service.listByBuilding(buildingId),
      meta: {
        synchronization: getSynchronizationState()
      }
    });
  });

  router.get('/elevators/:elevatorId', async (req, res) => {
    const buildingId = typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined;
    if (!buildingId) {
      res.status(400).json({ code: 'BUILDING_ID_REQUIRED', message: 'buildingId query parameter is required' });
      return;
    }
    if (!hasBuildingScope(req, buildingId)) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', message: 'Building scope is forbidden' });
      return;
    }

    await service.refreshFromDitto().catch(() => undefined);
    const twin = service.get(req.params.elevatorId);
    if (!twin || twin.buildingId !== buildingId) {
      res.status(404).json({ code: 'ELEVATOR_NOT_FOUND', message: 'Elevator not found' });
      return;
    }
    res.json(twin);
  });

  return router;
}
