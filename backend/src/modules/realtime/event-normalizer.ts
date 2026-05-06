import type { ElevatorTwin } from '../../contracts/elevator.js';
import { createElevatorTwin } from '../elevators/elevator-twin.model.js';
import type { DittoElevatorThingProjection } from '../../integrations/ditto/ditto-client.js';

export interface NormalizedEvent<TPayload> {
  eventId: string;
  eventType: string;
  schemaVersion: '1.1.0';
  dataClass: 'realtime' | 'telemetry' | 'config' | 'alarm';
  occurredAt: string;
  correlationId?: string;
  payload: TPayload;
}

export function normalizeTwinBootstrapProjection(
  projection: DittoElevatorThingProjection
): ElevatorTwin | null {
  if (!projection.buildingId) {
    return null;
  }

  return createElevatorTwin({
    elevatorId: projection.elevatorId,
    buildingId: projection.buildingId,
    shaftId: normalizeOptionalString(projection.shaftId),
    status: normalizeStatus(projection.status),
    currentFloor: normalizeNumber(projection.currentFloor, 0),
    targetFloor: normalizeOptionalNumber(projection.targetFloor),
    positionMeters: normalizeOptionalNumber(projection.positionMeters),
    floorProgress: normalizeOptionalPercentFraction(projection.floorProgress),
    speedMps: normalizeOptionalNumber(projection.speedMps),
    accelerationMps2: normalizeOptionalNumber(projection.accelerationMps2),
    direction: normalizeDirection(projection.direction),
    doorState: normalizeDoorState(projection.doorState),
    doorOpenPercent: normalizeOptionalPercent(projection.doorOpenPercent),
    doorObstruction: normalizeOptionalBoolean(projection.doorObstruction),
    doorCycleCount: normalizeOptionalNumber(projection.doorCycleCount),
    loadKg: normalizeOptionalNumber(projection.loadKg),
    ratedLoadKg: normalizeOptionalNumber(projection.ratedLoadKg),
    loadPercentage: normalizeOptionalNumber(projection.loadPercentage),
    occupancyEstimate: normalizeOptionalNumber(projection.occupancyEstimate),
    mode: normalizeMode(projection.mode),
    serviceMode: normalizeOptionalString(projection.serviceMode),
    brakeState: normalizeBrakeState(projection.brakeState),
    motorState: normalizeMotorState(projection.motorState),
    controllerState: normalizeControllerState(projection.controllerState),
    motorTempC: normalizeOptionalNumber(projection.motorTempC),
    controllerTempC: normalizeOptionalNumber(projection.controllerTempC),
    powerKw: normalizeOptionalNumber(projection.powerKw),
    vibrationLevel: normalizeOptionalNumber(projection.vibrationLevel),
    healthState: normalizeHealthState(projection.healthState),
    faultCode: normalizeOptionalString(projection.faultCode),
    faultSeverity: normalizeFaultSeverity(projection.faultSeverity),
    lastFaultAt: normalizeOptionalString(projection.lastFaultAt),
    activeCalls: normalizeActiveCalls(projection.activeCalls),
    stopQueue: normalizeNumberArray(projection.stopQueue),
    etaSeconds: normalizeOptionalNumber(projection.etaSeconds),
    lastEventAt: new Date().toISOString()
  });
}

export function normalizeTwinLiveProjection(
  projection: DittoElevatorThingProjection,
  occurredAt: string
): ElevatorTwin | null {
  const twin = normalizeTwinBootstrapProjection(projection);
  return twin
    ? {
        ...twin,
        lastEventAt: occurredAt
      }
    : null;
}

export function normalizeElevatorState(payload: Partial<ElevatorTwin> & Pick<ElevatorTwin, 'elevatorId' | 'buildingId'>): NormalizedEvent<ElevatorTwin> {
  return {
    eventId: `evt-${payload.elevatorId}-${Date.now()}`,
    eventType: 'elevator.state.changed',
    schemaVersion: '1.1.0',
    dataClass: 'realtime',
    occurredAt: new Date().toISOString(),
    payload: {
      schemaVersion: '1.1.0',
      deviceType: 'elevator',
      status: 'idle',
      currentFloor: 0,
      direction: 'unknown',
      doorState: 'unknown',
      healthState: 'unknown',
      mode: 'unknown',
      brakeState: 'unknown',
      motorState: 'unknown',
      controllerState: 'unknown',
      activeCalls: [],
      stopQueue: [],
      lastEventAt: new Date().toISOString(),
      stale: false,
      ...payload
    }
  };
}

function normalizeStatus(value: unknown): ElevatorTwin['status'] {
  return value === 'idle' ||
    value === 'moving' ||
    value === 'door_open' ||
    value === 'maintenance' ||
    value === 'fault' ||
    value === 'offline' ||
    value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeDirection(value: unknown): ElevatorTwin['direction'] {
  return value === 'up' || value === 'down' || value === 'stationary' || value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeDoorState(value: unknown): ElevatorTwin['doorState'] {
  return value === 'open' ||
    value === 'closed' ||
    value === 'opening' ||
    value === 'closing' ||
    value === 'blocked' ||
    value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeHealthState(value: unknown): ElevatorTwin['healthState'] {
  return value === 'normal' || value === 'warning' || value === 'critical' || value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeMode(value: unknown): ElevatorTwin['mode'] {
  return value === 'normal' ||
    value === 'inspection' ||
    value === 'fire_service' ||
    value === 'independent_service' ||
    value === 'maintenance' ||
    value === 'emergency' ||
    value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeBrakeState(value: unknown): ElevatorTwin['brakeState'] {
  return value === 'engaged' || value === 'released' || value === 'unknown' ? value : 'unknown';
}

function normalizeMotorState(value: unknown): ElevatorTwin['motorState'] {
  return value === 'idle' || value === 'running' || value === 'fault' || value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeControllerState(value: unknown): ElevatorTwin['controllerState'] {
  return value === 'normal' || value === 'warning' || value === 'fault' || value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeFaultSeverity(value: unknown): ElevatorTwin['faultSeverity'] {
  return value === 'info' || value === 'warning' || value === 'critical' ? value : undefined;
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalPercent(value: unknown): number | undefined {
  const number = normalizeOptionalNumber(value);
  return number === undefined ? undefined : Math.min(100, Math.max(0, number));
}

function normalizeOptionalPercentFraction(value: unknown): number | undefined {
  const number = normalizeOptionalNumber(value);
  return number === undefined ? undefined : Math.min(1, Math.max(0, number));
}

function normalizeOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function normalizeNumberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
    : [];
}

function normalizeActiveCalls(value: unknown): ElevatorTwin['activeCalls'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      floor: normalizeNumber(item.floor, 0),
      direction:
        item.direction === 'up' ||
        item.direction === 'down' ||
        item.direction === 'destination' ||
        item.direction === 'unknown'
          ? item.direction
          : 'unknown',
      type:
        item.type === 'hall' || item.type === 'car' || item.type === 'destination' || item.type === 'unknown'
          ? item.type
          : 'unknown'
    }));
}
