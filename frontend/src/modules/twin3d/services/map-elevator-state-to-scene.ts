import type { ElevatorViewModel } from '../../../store/elevator-store';

export interface BuildingShaftLayout {
  buildingId: string;
  floorHeightMeters: number;
  minFloor: number;
  maxFloor: number;
  shafts: ShaftDefinition[];
}

export interface ShaftDefinition {
  shaftId: string;
  elevatorId?: string;
  x: number;
  z: number;
  widthMeters: number;
  depthMeters: number;
  servedFloors: number[];
}

export interface TwinSceneAsset {
  elevatorId: string;
  buildingId?: string;
  shaftId: string;
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
  targetWorldPosition: {
    x: number;
    y: number;
    z: number;
  };
  cabinHeight: number;
  doorOpenRatio: number;
  shaftLabel: string;
  loadTone: 'normal' | 'warning' | 'critical' | 'unknown';
  faultTone: 'none' | 'warning' | 'critical';
  modeTone: 'normal' | 'service' | 'emergency' | 'unknown';
  cameraTarget: {
    x: number;
    y: number;
    z: number;
  };
  animationDurationMs: number;
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
  isPlayback: boolean;
  highlighted: boolean;
  label: string;
}

export const DEFAULT_BUILDING_SHAFT_LAYOUT: BuildingShaftLayout = {
  buildingId: 'L72',
  floorHeightMeters: 3,
  minFloor: 1,
  maxFloor: 72,
  shafts: [
    { shaftId: 'shaft-a', elevatorId: 'org.example:L72-ELEV-A', x: 0, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] },
    { shaftId: 'shaft-b', elevatorId: 'org.example:L72-ELEV-B', x: 3.8, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] },
    { shaftId: 'shaft-c', elevatorId: 'org.example:L72-ELEV-C', x: 7.6, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] },
    { shaftId: 'shaft-d', x: 11.4, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] },
    { shaftId: 'shaft-e', x: 15.2, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] },
    { shaftId: 'shaft-f', x: 19, z: 0, widthMeters: 1.7, depthMeters: 1.25, servedFloors: [] }
  ]
};

export function mapElevatorStateToScene(
  elevator: ElevatorViewModel,
  highlighted = false,
  layout: BuildingShaftLayout = DEFAULT_BUILDING_SHAFT_LAYOUT
): TwinSceneAsset {
  const healthTone = normalizeHealthTone(elevator.healthState);
  const doorVisualState = normalizeDoorVisualState(elevator.doorState);
  const isStale = elevator.stale;
  const shaft = resolveShaft(elevator, layout);
  const shaftIndex = layout.shafts.findIndex((candidate) => candidate.shaftId === shaft.shaftId);
  const visualStatus = deriveVisualStatus(elevator.status, healthTone, isStale);
  const y = deriveCabinY(elevator, layout);
  const targetY = deriveTargetCabinY(elevator, layout, y);
  const doorOpenRatio = deriveDoorOpenRatio(doorVisualState, elevator.doorOpenPercent);
  const loadTone = deriveLoadTone(elevator.loadPercentage);
  const faultTone = deriveFaultTone(elevator.faultSeverity, elevator.faultCode);
  const modeTone = deriveModeTone(elevator.mode);

  return {
    elevatorId: elevator.elevatorId,
    buildingId: elevator.buildingId,
    shaftId: shaft.shaftId,
    shaftIndex: shaftIndex >= 0 ? shaftIndex : 0,
    floorPosition: elevator.currentFloor,
    targetFloor: elevator.targetFloor,
    y,
    x: shaft.x,
    z: highlighted ? shaft.z + 0.9 : shaft.z,
    height: 2.2,
    worldPosition: {
      x: shaft.x,
      y,
      z: highlighted ? shaft.z + 0.9 : shaft.z
    },
    targetWorldPosition: {
      x: shaft.x,
      y: targetY,
      z: highlighted ? shaft.z + 0.9 : shaft.z
    },
    cabinHeight: 2.2,
    doorOpenRatio,
    shaftLabel: shaft.shaftId,
    loadTone,
    faultTone,
    modeTone,
    cameraTarget: {
      x: shaft.x,
      y: y + 0.5,
      z: highlighted ? shaft.z + 0.9 : shaft.z
    },
    animationDurationMs: deriveAnimationDuration(elevator),
    movementDirection: normalizeDirection(elevator.direction),
    doorVisualState,
    healthTone,
    visualStatus,
    color: deriveColor(healthTone, visualStatus, isStale, faultTone, loadTone),
    isSelected: highlighted,
    isStale,
    isPlayback: Boolean(elevator.isPlayback),
    highlighted,
    label: `${elevator.elevatorId} floor ${elevator.currentFloor}${elevator.targetFloor ? ` -> ${elevator.targetFloor}` : ''}`
  };
}

function deriveAnimationDuration(elevator: ElevatorViewModel): number {
  if (elevator.stale) {
    return 0;
  }

  if (elevator.status === 'moving') {
    return 650;
  }

  if (elevator.doorState === 'opening' || elevator.doorState === 'closing') {
    return 450;
  }

  return 250;
}

function deriveColor(
  healthTone: TwinSceneAsset['healthTone'],
  visualStatus: TwinSceneAsset['visualStatus'],
  isStale: boolean,
  faultTone: TwinSceneAsset['faultTone'] = 'none',
  loadTone: TwinSceneAsset['loadTone'] = 'normal'
): TwinSceneAsset['color'] {
  if (visualStatus === 'fault' || healthTone === 'critical' || faultTone === 'critical' || loadTone === 'critical') {
    return 'red';
  }

  if (isStale || visualStatus === 'maintenance' || faultTone === 'warning' || loadTone === 'warning') {
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

function resolveShaft(elevator: ElevatorViewModel, layout: BuildingShaftLayout): ShaftDefinition {
  const byShaft = elevator.shaftId
    ? layout.shafts.find((shaft) => shaft.shaftId === elevator.shaftId)
    : undefined;
  const byElevator = layout.shafts.find((shaft) => shaft.elevatorId === elevator.elevatorId);
  const fallback = layout.shafts[deriveShaftIndex(elevator.elevatorId) % layout.shafts.length];
  return byShaft ?? byElevator ?? fallback ?? {
    shaftId: 'shaft-unknown',
    x: 0,
    z: 0,
    widthMeters: 1.7,
    depthMeters: 1.25,
    servedFloors: []
  };
}

function deriveCabinY(elevator: ElevatorViewModel, layout: BuildingShaftLayout): number {
  if (typeof elevator.positionMeters === 'number' && Number.isFinite(elevator.positionMeters)) {
    return elevator.positionMeters;
  }

  return (elevator.currentFloor - layout.minFloor) * layout.floorHeightMeters;
}

function deriveTargetCabinY(elevator: ElevatorViewModel, layout: BuildingShaftLayout, fallbackY: number): number {
  if (typeof elevator.targetFloor !== 'number' || !Number.isFinite(elevator.targetFloor)) {
    return fallbackY;
  }

  return (elevator.targetFloor - layout.minFloor) * layout.floorHeightMeters;
}

function deriveDoorOpenRatio(
  doorState: TwinSceneAsset['doorVisualState'],
  doorOpenPercent?: number
): number {
  if (typeof doorOpenPercent === 'number' && Number.isFinite(doorOpenPercent)) {
    return Math.min(1, Math.max(0, doorOpenPercent / 100));
  }

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

function deriveLoadTone(loadPercentage: unknown): TwinSceneAsset['loadTone'] {
  if (typeof loadPercentage !== 'number' || !Number.isFinite(loadPercentage)) {
    return 'unknown';
  }

  if (loadPercentage >= 100) {
    return 'critical';
  }

  if (loadPercentage >= 85) {
    return 'warning';
  }

  return 'normal';
}

function deriveFaultTone(
  faultSeverity: unknown,
  faultCode: unknown
): TwinSceneAsset['faultTone'] {
  if (faultSeverity === 'critical') {
    return 'critical';
  }

  if (faultSeverity === 'warning' || typeof faultCode === 'string') {
    return 'warning';
  }

  return 'none';
}

function deriveModeTone(mode: unknown): TwinSceneAsset['modeTone'] {
  if (mode === 'normal') {
    return 'normal';
  }

  if (mode === 'maintenance' || mode === 'inspection' || mode === 'independent_service') {
    return 'service';
  }

  if (mode === 'fire_service' || mode === 'emergency') {
    return 'emergency';
  }

  return 'unknown';
}
