import type { EnvConfig } from '../../config/env.js';
import { settings } from '../../config/settings.js';

type DittoHandler = (payload: unknown) => void;

export interface DittoThingFeature {
  properties?: Record<string, unknown>;
}

export interface DittoThing {
  thingId: string;
  policyId?: string;
  definition?: string | string[];
  attributes?: Record<string, unknown>;
  features?: Record<string, DittoThingFeature>;
}

export interface DittoElevatorThingProjection {
  elevatorId: string;
  buildingId?: string;
  status?: unknown;
  currentFloor?: unknown;
  targetFloor?: unknown;
  direction?: unknown;
  doorState?: unknown;
  loadPercentage?: unknown;
  healthState?: unknown;
}

export interface DittoClientOptions {
  httpUrl: string;
  wsUrl: string;
  username?: string;
  password?: string;
  bearerToken?: string;
  fetchImpl?: typeof fetch;
}

export interface ListThingsOptions {
  ids?: string[];
  fields?: string;
  timeout?: string;
}

export interface GetThingOptions {
  fields?: string;
  timeout?: string;
  condition?: string;
}

export interface DittoPolicy {
  entries: Record<string, unknown>;
  imports?: Record<string, unknown>;
}

export const DITTO_ELEVATOR_FIELDS = 'thingId,attributes,features';

export function projectDittoElevatorThing(thing: DittoThing): DittoElevatorThingProjection {
  const properties = thing.features?.elevator?.properties;
  const buildingId = typeof thing.attributes?.buildingId === 'string' ? thing.attributes.buildingId : undefined;

  return {
    elevatorId: thing.thingId,
    buildingId,
    status: properties?.status,
    currentFloor: properties?.currentFloor,
    targetFloor: properties?.targetFloor,
    direction: properties?.direction,
    doorState: properties?.doorState,
    loadPercentage: properties?.loadPercentage,
    healthState: properties?.healthState
  };
}

function createDefaultOptions(env: EnvConfig): DittoClientOptions {
  return {
    httpUrl: env.dittoHttpUrl,
    wsUrl: env.dittoWsUrl,
    username: env.dittoUsername,
    password: env.dittoPassword,
    bearerToken: env.dittoBearerToken
  };
}

export class DittoClient {
  private readonly handlers = new Set<DittoHandler>();
  private readonly httpUrl: string;
  private readonly wsUrl: string;
  private readonly username?: string;
  private readonly password?: string;
  private readonly bearerToken?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: DittoClientOptions = createDefaultOptions(settings.env)) {
    this.httpUrl = options.httpUrl.replace(/\/$/, '');
    this.wsUrl = options.wsUrl;
    this.username = options.username;
    this.password = options.password;
    this.bearerToken = options.bearerToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  getRealtimeUrl(): string {
    return this.wsUrl;
  }

  subscribe(handler: DittoHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(payload: unknown): void {
    this.handlers.forEach((handler) => handler(payload));
  }

  async listThings(options: ListThingsOptions = {}): Promise<DittoThing[]> {
    const search = new URLSearchParams();

    if (options.ids?.length) {
      search.set('ids', options.ids.join(','));
    }

    if (options.fields) {
      search.set('fields', options.fields);
    }

    if (options.timeout) {
      search.set('timeout', options.timeout);
    }

    return this.request<DittoThing[]>(`/api/2/things?${search.toString()}`);
  }

  async getThing(thingId: string, options: GetThingOptions = {}): Promise<DittoThing> {
    const search = new URLSearchParams();

    if (options.fields) {
      search.set('fields', options.fields);
    }

    if (options.timeout) {
      search.set('timeout', options.timeout);
    }

    if (options.condition) {
      search.set('condition', options.condition);
    }

    const encodedThingId = encodeURIComponent(thingId);
    return this.request<DittoThing>(`/api/2/things/${encodedThingId}?${search.toString()}`);
  }

  async upsertPolicy(policyId: string, policy: DittoPolicy): Promise<void> {
    const encodedPolicyId = encodeURIComponent(policyId);
    await this.requestVoid(`/api/2/policies/${encodedPolicyId}`, {
      method: 'PUT',
      body: JSON.stringify(policy)
    });
  }

  async upsertThing(thingId: string, thing: DittoThing): Promise<void> {
    const encodedThingId = encodeURIComponent(thingId);
    await this.requestVoid(`/api/2/things/${encodedThingId}`, {
      method: 'PUT',
      body: JSON.stringify(thing)
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchImpl(`${this.httpUrl}${path}`, {
      ...init,
      headers: this.createHeaders(init.body !== undefined, init.headers)
    });

    if (!response.ok) {
      throw new Error(`Ditto request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }

  private async requestVoid(path: string, init: RequestInit = {}): Promise<void> {
    const response = await this.fetchImpl(`${this.httpUrl}${path}`, {
      ...init,
      headers: this.createHeaders(init.body !== undefined, init.headers)
    });

    if (!response.ok) {
      throw new Error(`Ditto request failed: ${response.status} ${response.statusText}`);
    }
  }

  private createHeaders(hasJsonBody = false, headersInit?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (hasJsonBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    } else if (this.username && this.password) {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    return {
      ...headers,
      ...(headersInit ?? {})
    };
  }
}
