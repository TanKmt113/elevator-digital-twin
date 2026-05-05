import type { ElevatorTwin } from '../../contracts/elevator.js';
import { createElevatorTwin } from '../elevators/elevator-twin.model.js';
import type { DittoElevatorThingProjection } from '../../integrations/ditto/ditto-client.js';

export interface NormalizedEvent<TPayload> {
  eventId: string;
  eventType: string;
  schemaVersion: '1.0.0';
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
    status: normalizeStatus(projection.status),
    currentFloor: normalizeNumber(projection.currentFloor, 0),
    targetFloor: normalizeOptionalNumber(projection.targetFloor),
    direction: normalizeDirection(projection.direction),
    doorState: normalizeDoorState(projection.doorState),
    loadPercentage: normalizeOptionalNumber(projection.loadPercentage),
    healthState: normalizeHealthState(projection.healthState),
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
    schemaVersion: '1.0.0',
    dataClass: 'realtime',
    occurredAt: new Date().toISOString(),
    payload: {
      schemaVersion: '1.0.0',
      deviceType: 'elevator',
      status: 'idle',
      currentFloor: 0,
      direction: 'unknown',
      doorState: 'unknown',
      healthState: 'unknown',
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

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
