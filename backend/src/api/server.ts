import express from 'express';
import { createServer } from 'http';
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

export function createApp() {
  const app = express();
  app.use(express.json());

  const monitoringService = new ElevatorMonitoringService();
  const commandExecutionService = new CommandExecutionService(monitoringService);
  const alertsService = new AlertsService();
  const historyService = new ElevatorHistoryService();
  const riskAnalyticsService = new RiskAnalyticsService();
  app.use(createElevatorRoutes(monitoringService));

  const server = createServer(app);
  const sessions = createWsServer(server, new RealtimeSessionManager());
  const commandStatusPublisher = new CommandStatusPublisher(sessions);
  const alertPublisher = new AlertPublisher(sessions);
  const riskPublisher = new RiskPublisher(sessions);

  app.use(createCommandRoutes(commandExecutionService, commandStatusPublisher));
  app.use(createAlertsRoutes(alertsService, alertPublisher));
  app.use(createElevatorHistoryRoutes(historyService));
  app.use(createAnalyticsRoutes(riskAnalyticsService));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  riskAnalyticsService.ingest({
    riskWarningId: 'seed-risk-warning',
    elevatorId: 'L72-ELEV-A',
    riskLevel: 'moderate',
    predictedWindowHours: 96,
    generatedAt: new Date().toISOString(),
    drivers: ['usage']
  });
  riskPublisher.publish(
    riskAnalyticsService.list()[0] ?? {
      riskWarningId: 'seed-risk-warning',
      elevatorId: 'L72-ELEV-A',
      riskLevel: 'moderate',
      predictedWindowHours: 96,
      generatedAt: new Date().toISOString(),
      drivers: ['usage']
    }
  );

  return {
    app,
    server,
    sessions,
    monitoringService,
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
