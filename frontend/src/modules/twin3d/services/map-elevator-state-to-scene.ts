import type { ElevatorViewModel } from '../../../store/elevator-store';

export interface TwinSceneAsset {
  elevatorId: string;
  buildingId?: string;
  shaftIndex: number;
  floorPosition: number;
  targetFloor?: number;
  y: number;
  x: number;
  z: number;
  height: number;
  worldPosition: {
    x: number;
    y: number;
    z: number;
  };
  cabinHeight: number;
  doorOpenRatio: number;
  shaftLabel: string;
  movementDirection: 'up' | 'down' | 'stationary' | 'unknown';
  doorVisualState: 'open' | 'closed' | 'transitioning' | 'unknown';
  healthTone: 'normal' | 'warning' | 'critical' | 'unknown';
  visualStatus:
    | 'moving'
    | 'idle'
    | 'maintenance'
    | 'fault'
    | 'offline'
    | 'stale'
    | 'degraded'
    | 'unknown';
  color: 'green' | 'red' | 'yellow' | 'gray';
  isSelected: boolean;
  isStale: boolean;
  highlighted: boolean;
  label: string;
}

export function mapElevatorStateToScene(
  elevator: ElevatorViewModel,
  highlighted = false
): TwinSceneAsset {
  const healthTone = normalizeHealthTone(elevator.healthState);
  const doorVisualState = normalizeDoorVisualState(elevator.doorState);
  const isStale = elevator.stale;
  const shaftIndex = deriveShaftIndex(elevator.elevatorId);
  const visualStatus = deriveVisualStatus(elevator.status, healthTone, isStale);

  return {
    elevatorId: elevator.elevatorId,
    buildingId: elevator.buildingId,
    shaftIndex,
    floorPosition: elevator.currentFloor,
    targetFloor: elevator.targetFloor,
    y: elevator.currentFloor * 3,
    x: shaftIndex * 2.8,
    z: highlighted ? 0.9 : 0,
    height: 2.2,
    worldPosition: {
      x: shaftIndex * 2.8,
      y: elevator.currentFloor * 3,
      z: highlighted ? 0.9 : 0
    },
    cabinHeight: 2.2,
    doorOpenRatio: deriveDoorOpenRatio(doorVisualState),
    shaftLabel: `Shaft ${shaftIndex + 1}`,
    movementDirection: normalizeDirection(elevator.direction),
    doorVisualState,
    healthTone,
    visualStatus,
    color: deriveColor(healthTone, visualStatus, isStale),
    isSelected: highlighted,
    isStale,
    highlighted,
    label: `${elevator.elevatorId} @ floor ${elevator.currentFloor}`
  };
}

function deriveColor(
  healthTone: TwinSceneAsset['healthTone'],
  visualStatus: TwinSceneAsset['visualStatus'],
  isStale: boolean
): TwinSceneAsset['color'] {
  if (visualStatus === 'fault' || healthTone === 'critical') {
    return 'red';
  }

  if (isStale || visualStatus === 'maintenance') {
    return 'yellow';
  }

  if (healthTone === 'unknown' || visualStatus === 'offline' || visualStatus === 'unknown') {
    return 'gray';
  }

  return 'green';
}

function deriveVisualStatus(
  status: string,
  healthTone: TwinSceneAsset['healthTone'],
  isStale: boolean
): TwinSceneAsset['visualStatus'] {
  if (isStale) {
    return 'stale';
  }

  if (status === 'degraded') {
    return 'degraded';
  }

  if (healthTone === 'critical' || status === 'fault') {
    return 'fault';
  }

  if (status === 'maintenance') {
    return 'maintenance';
  }

  if (status === 'offline') {
    return 'offline';
  }

  if (status === 'moving') {
    return 'moving';
  }

  if (status === 'idle') {
    return 'idle';
  }

  return 'unknown';
}

function deriveShaftIndex(elevatorId: string): number {
  return elevatorId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
}

function deriveDoorOpenRatio(doorState: TwinSceneAsset['doorVisualState']): number {
  if (doorState === 'open') {
    return 1;
  }

  if (doorState === 'transitioning') {
    return 0.45;
  }

  return 0;
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
