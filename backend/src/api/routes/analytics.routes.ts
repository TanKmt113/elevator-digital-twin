import { Router } from 'express';
import { authenticateJwt } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { RiskAnalyticsService } from '../../modules/analytics/risk-analytics.service.js';

export function createAnalyticsRoutes(service: RiskAnalyticsService): Router {
  const router = Router();
  router.use(authenticateJwt, requireRoles('admin', 'maintenance', 'operator'));

  router.get('/analytics/risk', (_req, res) => {
    res.json({ items: service.list() });
  });

  router.get('/analytics/risk/readiness', (_req, res) => {
    res.json(service.readiness());
  });

  return router;
}
