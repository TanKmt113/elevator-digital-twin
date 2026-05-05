import WebSocket from 'ws';
import { settings } from '../../config/settings.js';
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
  return segments.length > 1 ? segments[1] : undefined;
}

function getEventTime(payload: Record<string, unknown>): string {
  const candidate =
    payload.timestamp ??
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
  if (isDittoThing(payload)) {
    return payload;
  }

  if (isDittoThing(payload.value)) {
    return payload.value;
  }

  const thingId =
    (typeof payload.thingId === 'string' ? payload.thingId : undefined) ??
    parseThingIdFromTopic(typeof payload.topic === 'string' ? payload.topic : undefined);

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
    private readonly onConnectionStateChange?: (state: 'connecting' | 'live' | 'degraded') => void
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
      this.socket = new WebSocket(this.client.getRealtimeUrl(), {
        headers: this.client.createAuthorizationHeaders()
      });
      this.socket.on('open', () => {
        this.reconnectAttempt = 0;
        this.onConnectionStateChange?.('live');
      });
      this.socket.on('message', (message) => {
        void this.handleIncomingPayload(message.toString());
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
    const parsed =
      typeof payload === 'string'
        ? this.parseJson(payload)
        : payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : null;

    if (!parsed) {
      this.onMalformedEvent?.();
      return;
    }

    const thing = await resolveThingFromPayload(this.client, parsed);
    if (!thing) {
      this.onMalformedEvent?.();
      return;
    }

    const normalized = normalizeLiveThing(parsed, thing);
    if (!normalized) {
      this.onMalformedEvent?.();
      return;
    }

    this.onAcceptedEvent(normalized);
  }

  private parseJson(payload: string): Record<string, unknown> | null {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
