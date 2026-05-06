import express from 'express';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { loadEnv } from '../config/env.js';
import { logger } from '../observability/logger.js';
import { ElevatorMonitoringService } from '../modules/elevators/elevator-monitoring.service.js';
import { createElevatorRoutes } from './routes/elevators.routes.js';
import { RealtimeSessionManager, createWsServer } from '../modules/realtime/ws-server.js';
import { createCommandRoutes } from './routes/commands.routes.js';
import { CommandExecutionService } from '../modules/elevators/command-execution.service.js';
import { CommandStatusPublisher } from '../modules/realtime/publishers/command-status.publisher.js';
import { createAlertsRoutes } from './routes/alerts.routes.js';
import { AlertsService } from '../modules/alerts/alerts.service.js';
import { AlertPublisher } from '../modules/realtime/publishers/alert.publisher.js';
import { ElevatorHistoryService } from '../modules/elevators/elevator-history.service.js';
import { createElevatorHistoryRoutes } from './routes/elevator-history.routes.js';
import { RiskAnalyticsService } from '../modules/analytics/risk-analytics.service.js';
import { createAnalyticsRoutes } from './routes/analytics.routes.js';
import { RiskPublisher } from '../modules/realtime/publishers/risk.publisher.js';
import { DittoClient } from '../integrations/ditto/ditto-client.js';
import { settings } from '../config/settings.js';
import { createDevDittoRoutes } from './routes/dev-ditto.routes.js';
import { createDevAuthRoutes } from './routes/dev-auth.routes.js';
import { createApiV1Router } from './routes/api-v1.routes.js';
import { InMemoryUserRepository } from '../modules/users/in-memory-user.repository.js';
import { InMemoryAuditRepository } from '../modules/audit/audit.repository.js';
import { ElevatorStatePublisher } from '../modules/realtime/publishers/elevator-state.publisher.js';
import { EventRouter } from '../modules/realtime/event-router.js';
import { DittoLiveConsumer } from '../integrations/ditto/ditto-live-consumer.js';
import type { RealtimeSynchronizationState } from '../contracts/elevator.js';
import { recordMalformedEventRejected } from '../observability/elevator-monitoring.metrics.js';

interface CreateAppOptions {
  dittoClient?: DittoClient;
  seedAnalytics?: boolean;
  bootstrapTwin?: boolean;
  userRepository?: InMemoryUserRepository;
  auditRepository?: InMemoryAuditRepository;
}

async function bootstrapAdminFromEnv(repo: InMemoryUserRepository): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || repo.list().length > 0) {
    return;
  }
  try {
    await repo.createUser({
      email,
      password,
      roles: ['platform_admin'],
      buildingIds: []
    });
    logger.info('bootstrap_admin_created', { email });
  } catch (error) {
    logger.error('bootstrap_admin_failed', {
      message: error instanceof Error ? error.message : 'unknown'
    });
  }
}

const openApiSpecPath = new URL('../../../specs/004-ditto-end-to-end/contracts/backend-api.yaml', import.meta.url);
const openApiSpec = readFileSync(openApiSpecPath, 'utf8');

export function getOpenApiSpec() {
  return openApiSpec;
}

export function renderSwaggerUiHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Keangnam Backend API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`;
}

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }

  if (settings.env.corsOrigins.includes(origin)) {
    return true;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

export function applyCorsHeaders(req: Request, res: Response, next: NextFunction): void {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;

  if (isAllowedCorsOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Correlation-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(applyCorsHeaders);
  app.use(express.json());

  const dittoClient = options.dittoClient ?? new DittoClient();
  const auditRepository = options.auditRepository ?? new InMemoryAuditRepository();
  const userRepository = options.userRepository ?? new InMemoryUserRepository();
  if (!options.userRepository) {
    if (process.env.NODE_ENV === 'test') {
      userRepository.seedTestPlatformAdmin();
    } else {
      void bootstrapAdminFromEnv(userRepository);
    }
  }
  const monitoringService = new ElevatorMonitoringService(undefined, undefined, dittoClient);
  const commandExecutionService = new CommandExecutionService(monitoringService);
  const alertsService = new AlertsService();
  const historyService = new ElevatorHistoryService();
  const riskAnalyticsService = new RiskAnalyticsService();
  const eventRouter = new EventRouter();
  app.get('/openapi.yaml', (_req, res) => {
    res.type('application/yaml').send(getOpenApiSpec());
  });
  app.get('/docs', (_req, res) => {
    res.type('html').send(renderSwaggerUiHtml());
  });
  app.get('/health', (_req, res) =>
    res.json({
      status: 'ok',
      synchronization: buildSynchronizationState(),
      bootstrap: monitoringService.getBootstrapSnapshot()
    })
  );

  const server = createServer(app);
  const sessions = createWsServer(server, new RealtimeSessionManager());
  const elevatorStatePublisher = new ElevatorStatePublisher(sessions);
  const commandStatusPublisher = new CommandStatusPublisher(sessions);
  const alertPublisher = new AlertPublisher(sessions);
  const riskPublisher = new RiskPublisher(sessions);
  let lastDittoLiveState = monitoringService.getSynchronizationState().dittoLiveState;

  const buildSynchronizationState = (): RealtimeSynchronizationState => {
    monitoringService.setFrontendRealtimeState(
      sessions.getFrontendRealtimeState(),
      sessions.getActiveSessionCount()
    );
    return monitoringService.getSynchronizationState();
  };

  const publishSynchronizationState = (buildingId?: string): void => {
    sessions.publish({
      eventId: `sync-${Date.now()}`,
      eventType: 'system.connection.state',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: new Date().toISOString(),
      payload: {
        ...buildSynchronizationState(),
        buildingId: buildingId ?? monitoringService.getSynchronizationState().buildingId
      }
    });
  };

  const publishResyncRequired = (buildingId?: string, reason = 'live_reconnected'): void => {
    sessions.publish({
      eventId: `resync-${Date.now()}`,
      eventType: 'dashboard.resync.required',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: new Date().toISOString(),
      payload: {
        buildingId: buildingId ?? monitoringService.getSynchronizationState().buildingId,
        reason,
        requestedAt: new Date().toISOString()
      }
    });
  };

  sessions.addLifecycleListener(() => {
    publishSynchronizationState();
  });

  app.use(
    '/api/v1',
    createApiV1Router({
      userRepository,
      auditRepository,
      dittoClient,
      defaultElevatorPolicyId: settings.env.defaultElevatorPolicyId,
      onThingMutated: () => monitoringService.refreshFromDitto()
    })
  );
  app.use(createDevAuthRoutes());
  app.use(createDevDittoRoutes(dittoClient));
  app.use(createElevatorRoutes(monitoringService, buildSynchronizationState));
  app.use(createCommandRoutes(commandExecutionService, commandStatusPublisher));
  app.use(createAlertsRoutes(alertsService, alertPublisher));
  app.use(createElevatorHistoryRoutes(historyService));
  app.use(createAnalyticsRoutes(riskAnalyticsService));

  if (options.seedAnalytics !== false) {
    riskAnalyticsService.ingest({
      riskWarningId: 'seed-risk-warning',
      elevatorId: 'L72-ELEV-A',
      riskLevel: 'moderate',
      predictedWindowHours: 96,
      generatedAt: new Date().toISOString(),
      drivers: ['usage'],
      modelVersion: 'seed-model-v1',
      validationRunId: 'seed-validation-run',
      modelTrace: {
        featureSet: 'seed-operations-dashboard',
        scoredAt: new Date().toISOString(),
        validationStatus: 'passed'
      }
    });
    riskPublisher.publish(
      riskAnalyticsService.list()[0] ?? {
        riskWarningId: 'seed-risk-warning',
        elevatorId: 'L72-ELEV-A',
        riskLevel: 'moderate',
        predictedWindowHours: 96,
        generatedAt: new Date().toISOString(),
        drivers: ['usage'],
        modelVersion: 'seed-model-v1',
        validationRunId: 'seed-validation-run',
        modelTrace: {
          featureSet: 'seed-operations-dashboard',
          scoredAt: new Date().toISOString(),
          validationStatus: 'passed'
        }
      }
    );
  }

  if (options.bootstrapTwin !== false && settings.env.twinSyncEnabled) {
    void monitoringService.bootstrapFromDitto().catch((error: unknown) => {
      logger.error('ditto_bootstrap_failed', {
        error: error instanceof Error ? error.message : 'unknown_error'
      });
    });
  }

  const liveConsumer = new DittoLiveConsumer(
    dittoClient,
    (event) => {
      const routed = eventRouter.route(event, monitoringService.getSynchronizationState().buildingId);
      monitoringService.setRejectionStats(eventRouter.getStats());
      if (!routed) {
        publishSynchronizationState();
        return;
      }

      const saved = monitoringService.upsert(routed.payload);
      elevatorStatePublisher.publishEvent({
        ...routed,
        payload: saved
      });
      publishSynchronizationState(saved.buildingId);
    },
    () => {
      const current = monitoringService.getSynchronizationState();
      recordMalformedEventRejected();
      logger.error('ditto_live_event_malformed', {
        malformedEventsRejected: current.malformedEventsRejected + 1
      });
      monitoringService.setRejectionStats({
        malformedEventsRejected: current.malformedEventsRejected + 1
      });
      publishSynchronizationState();
    },
    (state) => {
      const previousState = lastDittoLiveState;
      lastDittoLiveState = state;
      monitoringService.setDittoLiveState(state);
      if (previousState && previousState !== 'live' && state === 'live') {
        publishResyncRequired();
      }
      publishSynchronizationState();
    }
  );
  liveConsumer.start();

  return {
    app,
    server,
    sessions,
    monitoringService,
    dittoClient,
    eventRouter,
    commandExecutionService,
    alertsService,
    historyService,
    riskAnalyticsService
  };
}

if (process.env.NODE_ENV !== 'test') {
  const { server } = createApp();
  const { port } = loadEnv();
  server.listen(port, () => {
    logger.info('backend_server_started', { port });
  });
}
