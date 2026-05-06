import { Router } from 'express';
import { authenticateJwt, type AuthenticatedRequest } from '../../modules/auth/auth.middleware.js';
import { requireRoles } from '../../modules/auth/rbac.js';
import { CommandExecutionService } from '../../modules/elevators/command-execution.service.js';
import { CommandStatusPublisher } from '../../modules/realtime/publishers/command-status.publisher.js';

export function createCommandRoutes(
  service: CommandExecutionService,
  publisher: CommandStatusPublisher
): Router {
  const router = Router();
  router.use(
    authenticateJwt,
    requireRoles('operator', 'admin', 'maintenance', 'building_admin', 'platform_admin')
  );

  router.post('/commands', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Bearer token required' });
      return;
    }

    const command = service.submit(req.body, req.user);
    publisher.publish(command);

    if (command.status === 'rejected') {
      res.status(409).json({
        code: 'COMMAND_REJECTED',
        message: command.message,
        command
      });
      return;
    }

    res.status(202).json(command);
  });

  return router;
}
