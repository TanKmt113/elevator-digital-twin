import type { Server } from 'http';
import type { NormalizedEvent } from './event-normalizer.js';

export class RealtimeSessionManager {
  private readonly listeners = new Set<(event: NormalizedEvent<unknown>) => void>();

  addListener(listener: (event: NormalizedEvent<unknown>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: NormalizedEvent<unknown>): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

export function createWsServer(_server: Server, sessions: RealtimeSessionManager): RealtimeSessionManager {
  return sessions;
}
