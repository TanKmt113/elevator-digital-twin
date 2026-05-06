import type { ElevatorTwin } from '../../contracts/elevator.js';

export function createElevatorTwin(input: Partial<ElevatorTwin> & Pick<ElevatorTwin, 'elevatorId' | 'buildingId'>): ElevatorTwin {
  return {
    schemaVersion: '1.1.0',
    deviceType: 'elevator',
    status: 'idle',
    currentFloor: 0,
    direction: 'unknown',
    doorState: 'unknown',
    mode: 'unknown',
    brakeState: 'unknown',
    motorState: 'unknown',
    controllerState: 'unknown',
    activeCalls: [],
    stopQueue: [],
    healthState: 'unknown',
    lastEventAt: new Date().toISOString(),
    stale: false,
    ...input
  };
}
