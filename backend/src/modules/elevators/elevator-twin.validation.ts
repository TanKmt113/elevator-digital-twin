import type { ElevatorTwin } from '../../contracts/elevator.js';

export interface ElevatorTwinValidationResult {
  valid: boolean;
  errors: string[];
}

const PERCENT_FIELDS = ['doorOpenPercent', 'loadPercentage'] as const;
const FRACTION_FIELDS = ['floorProgress'] as const;
const FINITE_FIELDS = [
  'currentFloor',
  'targetFloor',
  'positionMeters',
  'speedMps',
  'accelerationMps2',
  'doorCycleCount',
  'loadKg',
  'ratedLoadKg',
  'occupancyEstimate',
  'motorTempC',
  'controllerTempC',
  'powerKw',
  'vibrationLevel',
  'etaSeconds'
] as const;

export function validateElevatorTwinForPublication(twin: ElevatorTwin): ElevatorTwinValidationResult {
  const errors: string[] = [];

  if (!twin.elevatorId) errors.push('elevatorId is required');
  if (!twin.buildingId) errors.push('buildingId is required');
  if (twin.schemaVersion !== '1.1.0') errors.push('schemaVersion must be 1.1.0');
  if (twin.deviceType !== 'elevator') errors.push('deviceType must be elevator');
  if (!twin.lastEventAt || Number.isNaN(Date.parse(twin.lastEventAt))) {
    errors.push('lastEventAt must be an ISO timestamp');
  }

  for (const field of FINITE_FIELDS) {
    validateFiniteField(twin, field, errors);
  }
  for (const field of PERCENT_FIELDS) {
    validateRangeField(twin, field, 0, 100, errors);
  }
  for (const field of FRACTION_FIELDS) {
    validateRangeField(twin, field, 0, 1, errors);
  }

  return { valid: errors.length === 0, errors };
}

function validateFiniteField(twin: ElevatorTwin, field: keyof ElevatorTwin, errors: string[]): void {
  const value = twin[field];
  if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
    errors.push(`${String(field)} must be finite when present`);
  }
}

function validateRangeField(
  twin: ElevatorTwin,
  field: keyof ElevatorTwin,
  min: number,
  max: number,
  errors: string[]
): void {
  const value = twin[field];
  if (value !== undefined && (typeof value !== 'number' || value < min || value > max)) {
    errors.push(`${String(field)} must be between ${min} and ${max}`);
  }
}
