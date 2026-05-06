import { parse } from 'node:url';
import type { IncomingMessage, Server } from 'http';
import type { Duplex } from 'stream';
import jwt from 'jsonwebtoken';
import WebSocket, { WebSocketServer } from 'ws';
import { settings } from '../../config/settings.js';
import type { RealtimeConnectionState } from '../../contracts/elevator.js';
import type { NormalizedEvent } from './event-normalizer.js';

interface SessionUser {
  userId: string;
  role: string;
  buildingId: string;
}

interface RealtimeSession {
  socket: WebSocket;
  buildingId: string;
  user: SessionUser;
}

function getEventBuildingId(event: NormalizedEvent<unknown>): string | undefined {
  if (!event.payload || typeof event.payload !== 'object') {
    return undefined;
  }

  const buildingId = (event.payload as Record<string, unknown>).buildingId;
  return typeof buildingId === 'string' ? buildingId : undefined;
}

function writeUpgradeResponse(socket: Duplex, statusCode: number, statusText: string): void {
  socket.write(`HTTP/1.1 ${statusCode} ${statusText}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

function authenticateRealtimeRequest(request: IncomingMessage): SessionUser | null {
  const { query } = parse(request.url ?? '', true);
  const token = typeof query.token === 'string' ? query.token : undefined;
  const requestedBuildingId = typeof query.buildingId === 'string' ? query.buildingId : undefined;

  if (!token || !requestedBuildingId) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, settings.env.jwtSecret) as SessionUser;
    if (decoded.buildingId !== requestedBuildingId) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export class RealtimeSessionManager {
  private readonly listeners = new Set<(event: NormalizedEvent<unknown>) => void>();
  private readonly sessions = new Set<RealtimeSession>();
  private readonly lifecycleListeners = new Set<() => void>();

  addListener(listener: (event: NormalizedEvent<unknown>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addLifecycleListener(listener: () => void): () => void {
    this.lifecycleListeners.add(listener);
    return () => this.lifecycleListeners.delete(listener);
  }

  addSession(socket: WebSocket, user: SessionUser): () => void {
    const session: RealtimeSession = {
      socket,
      buildingId: user.buildingId,
      user
    };
    this.sessions.add(session);
    this.notifyLifecycleListeners();

    return () => {
      this.sessions.delete(session);
      this.notifyLifecycleListeners();
    };
  }

  publish(event: NormalizedEvent<unknown>): void {
    const buildingId = getEventBuildingId(event);
    const encoded = JSON.stringify(event);

    for (const session of this.sessions) {
      if (session.socket.readyState !== WebSocket.OPEN) {
        this.sessions.delete(session);
        continue;
      }

      if (buildingId && session.buildingId !== buildingId) {
        continue;
      }

      session.socket.send(encoded);
    }

    this.listeners.forEach((listener) => listener(event));
  }

  getActiveSessionCount(buildingId?: string): number {
    let count = 0;

    for (const session of this.sessions) {
      if (session.socket.readyState !== WebSocket.OPEN) {
        continue;
      }

      if (buildingId && session.buildingId !== buildingId) {
        continue;
      }

      count += 1;
    }

    return count;
  }

  getFrontendRealtimeState(): RealtimeConnectionState {
    return this.getActiveSessionCount() > 0 ? 'live' : 'connecting';
  }

  private notifyLifecycleListeners(): void {
    this.lifecycleListeners.forEach((listener) => listener());
  }
}

export function createWsServer(server: Server, sessions: RealtimeSessionManager): RealtimeSessionManager {
  const wsServer = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url ?? '', true);
    if (pathname !== '/ws') {
      writeUpgradeResponse(socket, 404, 'Not Found');
      return;
    }

    const user = authenticateRealtimeRequest(request);
    if (!user) {
      writeUpgradeResponse(socket, 401, 'Unauthorized');
      return;
    }

    wsServer.handleUpgrade(request, socket, head, (websocket) => {
      wsServer.emit('connection', websocket, request, user);
    });
  });

  wsServer.on('connection', (socket: WebSocket, _request: IncomingMessage, user: SessionUser) => {
    const removeSession = sessions.addSession(socket, user);

    socket.on('close', () => {
      removeSession();
    });

    socket.on('error', () => {
      removeSession();
    });
  });

  return sessions;
}
