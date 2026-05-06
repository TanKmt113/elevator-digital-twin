import type { EnvConfig } from '../../config/env.js';
import { settings } from '../../config/settings.js';

type DittoHandler = (payload: unknown) => void;

export class DittoRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'DittoRequestError';
  }
}

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
  shaftId?: unknown;
  status?: unknown;
  currentFloor?: unknown;
  targetFloor?: unknown;
  positionMeters?: unknown;
  floorProgress?: unknown;
  speedMps?: unknown;
  accelerationMps2?: unknown;
  direction?: unknown;
  doorState?: unknown;
  doorOpenPercent?: unknown;
  doorObstruction?: unknown;
  doorCycleCount?: unknown;
  loadKg?: unknown;
  ratedLoadKg?: unknown;
  loadPercentage?: unknown;
  occupancyEstimate?: unknown;
  mode?: unknown;
  serviceMode?: unknown;
  brakeState?: unknown;
  motorState?: unknown;
  controllerState?: unknown;
  motorTempC?: unknown;
  controllerTempC?: unknown;
  powerKw?: unknown;
  vibrationLevel?: unknown;
  healthState?: unknown;
  faultCode?: unknown;
  faultSeverity?: unknown;
  lastFaultAt?: unknown;
  activeCalls?: unknown;
  stopQueue?: unknown;
  etaSeconds?: unknown;
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
  const shaftId = thing.attributes?.shaftId;

  return {
    elevatorId: thing.thingId,
    buildingId,
    shaftId,
    status: properties?.status,
    currentFloor: properties?.currentFloor,
    targetFloor: properties?.targetFloor,
    positionMeters: properties?.positionMeters,
    floorProgress: properties?.floorProgress,
    speedMps: properties?.speedMps,
    accelerationMps2: properties?.accelerationMps2,
    direction: properties?.direction,
    doorState: properties?.doorState,
    doorOpenPercent: properties?.doorOpenPercent,
    doorObstruction: properties?.doorObstruction,
    doorCycleCount: properties?.doorCycleCount,
    loadKg: properties?.loadKg,
    ratedLoadKg: properties?.ratedLoadKg,
    loadPercentage: properties?.loadPercentage,
    occupancyEstimate: properties?.occupancyEstimate,
    mode: properties?.mode,
    serviceMode: properties?.serviceMode,
    brakeState: properties?.brakeState,
    motorState: properties?.motorState,
    controllerState: properties?.controllerState,
    motorTempC: properties?.motorTempC,
    controllerTempC: properties?.controllerTempC,
    powerKw: properties?.powerKw,
    vibrationLevel: properties?.vibrationLevel,
    healthState: properties?.healthState,
    faultCode: properties?.faultCode,
    faultSeverity: properties?.faultSeverity,
    lastFaultAt: properties?.lastFaultAt,
    activeCalls: properties?.activeCalls,
    stopQueue: properties?.stopQueue,
    etaSeconds: properties?.etaSeconds
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

  getHttpUrl(): string {
    return this.httpUrl;
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

  async mergePatchThing(thingId: string, patch: Record<string, unknown>): Promise<void> {
    const encodedThingId = encodeURIComponent(thingId);
    await this.requestVoid(`/api/2/things/${encodedThingId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
      headers: { 'Content-Type': 'application/merge-patch+json' }
    });
  }

  async getThingOrNull(thingId: string): Promise<DittoThing | null> {
    try {
      return await this.getThing(thingId);
    } catch (error) {
      if (error instanceof DittoRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchImpl(`${this.httpUrl}${path}`, {
      ...init,
      headers: this.createHeaders(init.body !== undefined, init.headers)
    });

    if (!response.ok) {
      const text = await this.safeReadBody(response);
      throw new DittoRequestError(
        `Ditto request failed: ${response.status} ${response.statusText}`,
        response.status,
        text
      );
    }

    return (await response.json()) as T;
  }

  private async requestVoid(path: string, init: RequestInit = {}): Promise<void> {
    const response = await this.fetchImpl(`${this.httpUrl}${path}`, {
      ...init,
      headers: this.createHeaders(init.body !== undefined, init.headers)
    });

    if (!response.ok) {
      const text = await this.safeReadBody(response);
      throw new DittoRequestError(
        `Ditto request failed: ${response.status} ${response.statusText}`,
        response.status,
        text
      );
    }
  }

  private async safeReadBody(response: Response): Promise<string | undefined> {
    try {
      return await response.text();
    } catch {
      return undefined;
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

  createAuthorizationHeaders(): Record<string, string> {
    const headers = this.createHeaders(false);
    return typeof headers === 'object' && !Array.isArray(headers)
      ? (headers as Record<string, string>)
      : { Accept: 'application/json' };
  }
}
