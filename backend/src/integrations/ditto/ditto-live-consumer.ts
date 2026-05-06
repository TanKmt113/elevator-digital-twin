import WebSocket from 'ws';
import { settings } from '../../config/settings.js';
import { logger } from '../../observability/logger.js';
import {
  DITTO_ELEVATOR_FIELDS,
  type DittoClient,
  type DittoThing,
  projectDittoElevatorThing
} from './ditto-client.js';
import {
  normalizeTwinLiveProjection,
  type NormalizedEvent
} from '../../modules/realtime/event-normalizer.js';
import type { ElevatorTwin } from '../../contracts/elevator.js';

function isDittoThing(value: unknown): value is DittoThing {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'thingId' in value &&
      ('attributes' in value || 'features' in value)
  );
}

function parseThingIdFromTopic(topic: string | undefined): string | undefined {
  if (!topic) {
    return undefined;
  }

  const segments = topic.split('/');
  return segments.length > 1 && segments[0] && segments[1] ? `${segments[0]}:${segments[1]}` : undefined;
}

function parseThingIdFromSource(source: string | undefined): string | undefined {
  if (!source) {
    return undefined;
  }

  const match = source.match(/\/things\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function hasBuildingScope(thing: DittoThing): boolean {
  return typeof thing.attributes?.buildingId === 'string';
}

function summarizePayload(payload: unknown): unknown {
  if (typeof payload === 'string') {
    return payload.length > 1000 ? `${payload.slice(0, 1000)}...[truncated]` : payload;
  }

  if (Array.isArray(payload)) {
    return payload.slice(0, 5).map((item) => summarizePayload(item));
  }

  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (typeof value === 'string') {
      summary[key] = value.length > 500 ? `${value.slice(0, 500)}...[truncated]` : value;
    } else if (Array.isArray(value)) {
      summary[key] = value.slice(0, 5).map((item) => summarizePayload(item));
    } else if (value && typeof value === 'object') {
      summary[key] = summarizePayload(value);
    } else {
      summary[key] = value;
    }
  }

  return summary;
}

function getEventTime(payload: Record<string, unknown>): string {
  const headers = payload.headers && typeof payload.headers === 'object'
    ? (payload.headers as Record<string, unknown>)
    : undefined;
  const candidate =
    payload.timestamp ??
    headers?.timestamp ??
    payload.modified ??
    payload['_modified'] ??
    payload.time ??
    (payload.value && typeof payload.value === 'object'
      ? (payload.value as Record<string, unknown>).timestamp
      : undefined);

  return typeof candidate === 'string' ? candidate : new Date().toISOString();
}

async function resolveThingFromPayload(
  client: Pick<DittoClient, 'getThing'>,
  payload: Record<string, unknown>
): Promise<DittoThing | null> {
  if (isDittoThing(payload) && hasBuildingScope(payload)) {
    return payload;
  }

  if (isDittoThing(payload.value) && hasBuildingScope(payload.value)) {
    return payload.value;
  }

  const thingId =
    (typeof payload.thingId === 'string' ? payload.thingId : undefined) ??
    (isDittoThing(payload.value) ? payload.value.thingId : undefined) ??
    parseThingIdFromTopic(typeof payload.topic === 'string' ? payload.topic : undefined) ??
    parseThingIdFromSource(typeof payload.source === 'string' ? payload.source : undefined);

  if (!thingId) {
    return null;
  }

  try {
    return await client.getThing(thingId, {
      fields: DITTO_ELEVATOR_FIELDS,
      timeout: '3s'
    });
  } catch {
    return null;
  }
}

function normalizeLiveThing(
  payload: Record<string, unknown>,
  thing: DittoThing
): NormalizedEvent<ElevatorTwin> | null {
  const projection = projectDittoElevatorThing(thing);
  const occurredAt = getEventTime(payload);
  const twin = normalizeTwinLiveProjection(projection, occurredAt);

  if (!twin) {
    return null;
  }

  return {
    eventId:
      (typeof payload.id === 'string' ? payload.id : undefined) ??
      `evt-${thing.thingId}-${occurredAt}`,
    eventType: 'elevator.state.changed',
    schemaVersion: '1.0.0',
    dataClass: 'realtime',
    occurredAt,
    payload: {
      ...twin,
      lastEventAt: occurredAt
    }
  };
}

export class DittoLiveConsumer {
  private socket?: WebSocket;
  private unsubscribe?: () => void;
  private reconnectTimer?: NodeJS.Timeout;
  private reconnectAttempt = 0;
  private stopped = false;

  constructor(
    private readonly client: Pick<
      DittoClient,
      'subscribe' | 'getRealtimeUrl' | 'createAuthorizationHeaders' | 'getThing'
    >,
    private readonly onAcceptedEvent: (event: NormalizedEvent<ElevatorTwin>) => void,
    private readonly onMalformedEvent?: () => void,
    private readonly onConnectionStateChange?: (state: 'connecting' | 'live' | 'degraded') => void,
    private readonly socketFactory: (
      url: string,
      options: { headers: Record<string, string> }
    ) => WebSocket = (url, options) => new WebSocket(url, options)
  ) {}

  start(): void {
    this.stopped = false;
    this.unsubscribe = this.client.subscribe((payload) => {
      void this.handleIncomingPayload(payload);
    });

    this.connectSocket();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.socket?.removeAllListeners();
    this.socket?.close();
    this.socket = undefined;
  }

  private connectSocket(): void {
    try {
      this.onConnectionStateChange?.('connecting');
      this.socket = this.socketFactory(this.client.getRealtimeUrl(), {
        headers: this.client.createAuthorizationHeaders()
      });
      this.socket.on('open', () => {
        this.reconnectAttempt = 0;
        this.socket?.send('START-SEND-EVENTS');
        this.onConnectionStateChange?.('live');
      });
      this.socket.on('message', (message) => {
        const text = message.toString();
        if (text.trim().endsWith(':ACK')) {
          return;
        }

        void this.handleIncomingPayload(text);
      });
      this.socket.on('error', () => {
        this.onConnectionStateChange?.('degraded');
        this.scheduleReconnect();
      });
      this.socket.on('close', () => {
        this.onConnectionStateChange?.('degraded');
        this.scheduleReconnect();
      });
    } catch {
      this.onConnectionStateChange?.('degraded');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) {
      return;
    }

    const backoff = settings.reconnectBackoffMs;
    const delay =
      backoff[Math.min(this.reconnectAttempt, backoff.length - 1)] ?? backoff[backoff.length - 1] ?? 1000;

    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.stopped) {
        return;
      }

      this.connectSocket();
    }, delay);
  }

  private async handleIncomingPayload(payload: unknown): Promise<void> {
    const payloads = this.parsePayloads(payload);
    if (payloads.length === 0) {
      this.logMalformed('parse_failed', payload);
      this.onMalformedEvent?.();
      return;
    }

    for (const parsed of payloads) {
      await this.handleParsedPayload(parsed);
    }
  }

  private async handleParsedPayload(payload: Record<string, unknown>): Promise<void> {
    const parsed = this.unwrapPayload(payload);
    if (!parsed) {
      this.logMalformed('unsupported_wrapper', payload);
      this.onMalformedEvent?.();
      return;
    }

    const thing = await resolveThingFromPayload(this.client, parsed);
    if (!thing) {
      this.logMalformed('thing_resolution_failed', parsed);
      this.onMalformedEvent?.();
      return;
    }

    const normalized = normalizeLiveThing(parsed, thing);
    if (!normalized) {
      this.logMalformed('normalization_failed', parsed);
      this.onMalformedEvent?.();
      return;
    }

    this.onAcceptedEvent(normalized);
  }

  private parsePayloads(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
    }

    const parsed =
      typeof payload === 'string'
        ? this.parseTextPayloads(payload)
        : payload && typeof payload === 'object'
          ? [payload as Record<string, unknown>]
          : [];

    return parsed;
  }

  private parseTextPayloads(payload: string): Record<string, unknown>[] {
    const text = payload.trim();
    if (!text || text.endsWith(':ACK')) {
      return [];
    }

    const candidates = [text, ...text.split(/\r?\n/).map((line) => line.trim())];
    for (const candidate of candidates) {
      if (!candidate || candidate.endsWith(':ACK')) {
        continue;
      }

      const jsonText = candidate.startsWith('data:') ? candidate.slice(5).trim() : candidate;
      try {
        const parsed = JSON.parse(jsonText) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
        }

        if (parsed && typeof parsed === 'object') {
          return [parsed as Record<string, unknown>];
        }
      } catch {
        continue;
      }
    }

    return [];
  }

  private unwrapPayload(payload: Record<string, unknown>): Record<string, unknown> | null {
    if (payload.topic || payload.thingId || isDittoThing(payload)) {
      return payload;
    }

    const data = payload.data;
    if (typeof data === 'string') {
      const parsed = this.parseTextPayloads(data)[0];
      return parsed
        ? {
            ...parsed,
            id: typeof payload.id === 'string' ? payload.id : parsed.id,
            time: typeof payload.time === 'string' ? payload.time : parsed.time,
            source: typeof payload.source === 'string' ? payload.source : parsed.source
          }
        : null;
    }

    if (data && typeof data === 'object') {
      return {
        ...(data as Record<string, unknown>),
        id: typeof payload.id === 'string' ? payload.id : (data as Record<string, unknown>).id,
        time: typeof payload.time === 'string' ? payload.time : (data as Record<string, unknown>).time,
        source: typeof payload.source === 'string' ? payload.source : (data as Record<string, unknown>).source
      };
    }

    return null;
  }

  private logMalformed(reason: string, payload: unknown): void {
    logger.error('ditto_live_event_malformed_payload', {
      reason,
      payload: summarizePayload(payload)
    });
  }
}
