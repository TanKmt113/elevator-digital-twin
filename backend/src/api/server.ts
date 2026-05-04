import express from 'express';
import { createServer } from 'http';
import { loadEnv } from '../config/env.js';
import { logger } from '../observability/logger.js';
import { ElevatorMonitoringService } from '../modules/elevators/elevator-monitoring.service.js';
import { createElevatorRoutes } from './routes/elevators.routes.js';
import { RealtimeSessionManager, createWsServer } from '../modules/realtime/ws-server.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  const monitoringService = new ElevatorMonitoringService();
  app.use(createElevatorRoutes(monitoringService));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const server = createServer(app);
  const sessions = createWsServer(server, new RealtimeSessionManager());

  return { app, server, sessions, monitoringService };
}

if (process.env.NODE_ENV !== 'test') {
  const { server } = createApp();
  const { port } = loadEnv();
  server.listen(port, () => {
    logger.info('backend_server_started', { port });
  });
}
