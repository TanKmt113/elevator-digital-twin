import type { ElevatorTwin } from '../../contracts/elevator.js';

export interface NormalizedEvent<TPayload> {
  eventId: string;
  eventType: string;
  schemaVersion: '1.0.0';
  dataClass: 'realtime' | 'telemetry' | 'config' | 'alarm';
  occurredAt: string;
  correlationId?: string;
  payload: TPayload;
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
