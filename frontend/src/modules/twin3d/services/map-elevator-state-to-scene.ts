import type { ElevatorViewModel } from '../../../store/elevator-store';

export interface TwinSceneAsset {
  elevatorId: string;
  buildingId?: string;
  floorPosition: number;
  y: number;
  movementDirection: 'up' | 'down' | 'stationary' | 'unknown';
  doorVisualState: 'open' | 'closed' | 'transitioning' | 'unknown';
  healthTone: 'normal' | 'warning' | 'critical' | 'unknown';
  color: 'green' | 'red' | 'yellow' | 'gray';
  isSelected: boolean;
  isStale: boolean;
  highlighted: boolean;
}

export function mapElevatorStateToScene(
  elevator: ElevatorViewModel,
  highlighted = false
): TwinSceneAsset {
  const healthTone = normalizeHealthTone(elevator.healthState);
  const doorVisualState = normalizeDoorVisualState(elevator.doorState);
  const isStale = elevator.stale;

  return {
    elevatorId: elevator.elevatorId,
    buildingId: elevator.buildingId,
    floorPosition: elevator.currentFloor,
    y: elevator.currentFloor * 3,
    movementDirection: normalizeDirection(elevator.direction),
    doorVisualState,
    healthTone,
    color: healthTone === 'critical' ? 'red' : isStale ? 'yellow' : healthTone === 'unknown' ? 'gray' : 'green',
    isSelected: highlighted,
    isStale,
    highlighted
  };
}

function normalizeDirection(value: string): TwinSceneAsset['movementDirection'] {
  return value === 'up' || value === 'down' || value === 'stationary' || value === 'unknown'
    ? value
    : 'unknown';
}

function normalizeDoorVisualState(value: string): TwinSceneAsset['doorVisualState'] {
  if (value === 'open' || value === 'closed') {
    return value;
  }

  if (value === 'opening' || value === 'closing') {
    return 'transitioning';
  }

  return 'unknown';
}

function normalizeHealthTone(value: string): TwinSceneAsset['healthTone'] {
  return value === 'normal' || value === 'warning' || value === 'critical' || value === 'unknown'
    ? value
    : 'unknown';
}
