import type { ElevatorTwin } from '../../src/contracts/elevator.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';

const base = {
  elevatorId: 'org.example:L72-ELEV-A',
  buildingId: 'L72',
  currentFloor: 12,
  direction: 'stationary' as const,
  doorState: 'closed' as const,
  healthState: 'normal' as const,
  status: 'idle' as const,
  lastEventAt: '2026-05-06T10:00:00.000Z',
  stale: false
};

export function riskInput(overrides: Partial<ElevatorTwin> = {}): ElevatorTwin {
  return createElevatorTwin({
    ...base,
    ...overrides
  });
}

export const normalRiskInput = riskInput();

export const doorBlockedRiskInput = riskInput({
  doorState: 'blocked',
  doorObstruction: true
});

export const activeFaultRiskInput = riskInput({
  status: 'fault',
  healthState: 'critical',
  faultCode: 'DOOR-LOCK-ERR',
  faultSeverity: 'critical'
});

export const thermalRiskInput = riskInput({
  motorTempC: 92,
  controllerTempC: 88
});

export const vibrationRiskInput = riskInput({
  vibrationLevel: 8.5
});

export const overloadRiskInput = riskInput({
  loadPercentage: 118
});
