import type { DittoClient, DittoThing } from '../../integrations/ditto/ditto-client.js';
import { DittoRequestError } from '../../integrations/ditto/ditto-client.js';
import type { InMemoryAuditRepository } from '../audit/audit.repository.js';
import type { ElevatorThingPatchInput, ElevatorThingProvisionInput } from './elevator-thing.schema.js';

const defaultElevatorProperties = (): Record<string, unknown> => ({
  status: 'idle',
  currentFloor: 1,
  targetFloor: 1,
  positionMeters: 0,
  floorProgress: 0,
  speedMps: 0,
  accelerationMps2: 0,
  direction: 'stationary',
  doorState: 'closed',
  doorOpenPercent: 0,
  doorObstruction: false,
  doorCycleCount: 0,
  loadKg: 0,
  ratedLoadKg: 1000,
  loadPercentage: 0,
  occupancyEstimate: 0,
  mode: 'normal',
  serviceMode: 'normal',
  brakeState: 'engaged',
  motorState: 'idle',
  controllerState: 'normal',
  motorTempC: 0,
  controllerTempC: 0,
  powerKw: 0,
  vibrationLevel: 0,
  healthState: 'normal',
  faultCode: null,
  faultSeverity: null,
  lastFaultAt: null,
  activeCalls: [],
  stopQueue: [],
  etaSeconds: 0,
  lastUpdatedAt: new Date().toISOString()
});

function buildThing(
  buildingId: string,
  input: ElevatorThingProvisionInput,
  defaultPolicyId: string
): DittoThing {
  const policyId = input.policyId ?? defaultPolicyId;
  const properties = { ...defaultElevatorProperties(), ...(input.properties ?? {}) };
  return {
    thingId: input.thingId,
    policyId,
    attributes: {
      buildingId,
      deviceType: 'elevator',
      shaftId: input.shaftId
    },
    features: {
      elevator: { properties }
    }
  };
}

export class ThingProvisioningService {
  constructor(
    private readonly ditto: DittoClient,
    private readonly audit: InMemoryAuditRepository,
    private readonly defaultPolicyId: string
  ) {}

  async createThing(
    buildingId: string,
    input: ElevatorThingProvisionInput,
    actorUserId: string,
    correlationId: string
  ): Promise<{ thingId: string; buildingId: string; created: boolean }> {
    const existing = await this.ditto.getThingOrNull(input.thingId);
    if (existing) {
      this.audit.append({
        actorUserId,
        action: 'thing.create',
        resourceType: 'ditto_thing',
        resourceId: input.thingId,
        buildingId,
        payloadSummary: { thingId: input.thingId },
        outcome: 'failure',
        correlationId
      });
      const err = new Error('THING_EXISTS');
      (err as Error & { status: number }).status = 409;
      throw err;
    }
    const thing = buildThing(buildingId, input, this.defaultPolicyId);
    await this.ditto.upsertThing(input.thingId, thing);
    this.audit.append({
      actorUserId,
      action: 'thing.create',
      resourceType: 'ditto_thing',
      resourceId: input.thingId,
      buildingId,
      payloadSummary: { thingId: input.thingId, shaftId: input.shaftId },
      outcome: 'success',
      correlationId
    });
    return { thingId: input.thingId, buildingId, created: true };
  }

  async getThing(buildingId: string, thingId: string): Promise<DittoThing> {
    const thing = await this.ditto.getThing(thingId);
    const bid = typeof thing.attributes?.buildingId === 'string' ? thing.attributes.buildingId : undefined;
    if (bid !== buildingId) {
      const err = new Error('THING_BUILDING_MISMATCH');
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    return thing;
  }

  async patchThing(
    buildingId: string,
    thingId: string,
    patch: ElevatorThingPatchInput,
    actorUserId: string,
    correlationId: string
  ): Promise<void> {
    await this.getThing(buildingId, thingId);
    const merge: Record<string, unknown> = {};
    if (patch.properties && Object.keys(patch.properties).length > 0) {
      merge.features = { elevator: { properties: patch.properties } };
    }
    if (Object.keys(merge).length === 0) {
      return;
    }
    await this.ditto.mergePatchThing(thingId, merge);
    this.audit.append({
      actorUserId,
      action: 'thing.update',
      resourceType: 'ditto_thing',
      resourceId: thingId,
      buildingId,
      payloadSummary: { keys: Object.keys(patch.properties ?? {}) },
      outcome: 'success',
      correlationId
    });
  }

  async archiveThing(
    buildingId: string,
    thingId: string,
    actorUserId: string,
    correlationId: string
  ): Promise<void> {
    await this.getThing(buildingId, thingId);
    await this.ditto.mergePatchThing(thingId, {
      attributes: { archivedAt: new Date().toISOString() }
    });
    this.audit.append({
      actorUserId,
      action: 'thing.archive',
      resourceType: 'ditto_thing',
      resourceId: thingId,
      buildingId,
      payloadSummary: {},
      outcome: 'success',
      correlationId
    });
  }

  mapDittoFailure(error: unknown): { status: number; code: string; message: string } {
    if (error instanceof DittoRequestError) {
      if (error.status === 409) {
        return { status: 409, code: 'DITTO_CONFLICT', message: error.message };
      }
      if (error.status >= 500) {
        return { status: 503, code: 'DITTO_UNAVAILABLE', message: 'Ditto upstream error' };
      }
    }
    return { status: 502, code: 'DITTO_ERROR', message: error instanceof Error ? error.message : 'Ditto error' };
  }
}
