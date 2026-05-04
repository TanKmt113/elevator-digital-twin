import { Router } from 'express';
import { authenticateJwt, type AuthenticatedRequest } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { AlertsService } from '../../modules/alerts/alerts.service.js';
import { AlertPublisher } from '../../modules/realtime/publishers/alert.publisher.js';
import { recordAlertAcknowledged } from '../../observability/alert.metrics.js';

export function createAlertsRoutes(service: AlertsService, publisher: AlertPublisher): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('operator', 'admin', 'maintenance'));

  router.get('/alerts', (_req, res) => {
    res.json({ items: service.list() });
  });

  router.post('/alerts/:alertId/acknowledge', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Bearer token required' });
      return;
    }
    const alert = service.acknowledge(String(req.params.alertId), req.user.userId);
    if (!alert) {
      res.status(404).json({ code: 'ALERT_NOT_FOUND', message: 'Alert not found' });
      return;
    }
    recordAlertAcknowledged();
    publisher.publishUpdated(alert);
    res.json(alert);
  });

  return router;
}
