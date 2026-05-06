export type ElevatorStatus =
  | 'idle'
  | 'moving'
  | 'door_open'
  | 'maintenance'
  | 'fault'
  | 'offline'
  | 'unknown';

export type TwinBootstrapStatus = 'idle' | 'loading' | 'completed' | 'partial' | 'empty' | 'failed';

export type RealtimeConnectionState =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'degraded'
  | 'resyncing';

export type ElevatorMode =
  | 'normal'
  | 'inspection'
  | 'fire_service'
  | 'independent_service'
  | 'maintenance'
  | 'emergency'
  | 'unknown';

export type BrakeState = 'engaged' | 'released' | 'unknown';
export type MotorState = 'idle' | 'running' | 'fault' | 'unknown';
export type ControllerState = 'normal' | 'warning' | 'fault' | 'unknown';
export type FaultSeverity = 'info' | 'warning' | 'critical';

export interface ElevatorCall {
  floor: number;
  direction?: 'up' | 'down' | 'destination' | 'unknown';
  type?: 'hall' | 'car' | 'destination' | 'unknown';
}

export interface ElevatorTwin {
  elevatorId: string;
  buildingId: string;
  shaftId?: string;
  schemaVersion: '1.0.0' | '1.1.0';
  deviceType: 'elevator';
  status: ElevatorStatus;
  currentFloor: number;
  targetFloor?: number;
  positionMeters?: number;
  floorProgress?: number;
  speedMps?: number;
  accelerationMps2?: number;
  direction: 'up' | 'down' | 'stationary' | 'unknown';
  doorState: 'open' | 'closed' | 'opening' | 'closing' | 'blocked' | 'unknown';
  doorOpenPercent?: number;
  doorObstruction?: boolean;
  doorCycleCount?: number;
  loadKg?: number;
  ratedLoadKg?: number;
  loadPercentage?: number;
  occupancyEstimate?: number;
  mode?: ElevatorMode;
  serviceMode?: string;
  brakeState?: BrakeState;
  motorState?: MotorState;
  controllerState?: ControllerState;
  motorTempC?: number;
  controllerTempC?: number;
  powerKw?: number;
  vibrationLevel?: number;
  healthState: 'normal' | 'warning' | 'critical' | 'unknown';
  faultCode?: string;
  faultSeverity?: FaultSeverity;
  lastFaultAt?: string;
  activeCalls?: ElevatorCall[];
  stopQueue?: number[];
  etaSeconds?: number;
  fieldFreshness?: Record<string, string>;
  lastEventAt: string;
  stale: boolean;
}

export interface TwinBootstrapSnapshot {
  snapshotId: string;
  buildingId: string;
  source: 'twin';
  requestedAt: string;
  completedAt?: string;
  status: TwinBootstrapStatus;
  elevators: ElevatorTwin[];
  missingElevatorIds?: string[];
  failureReason?: string;
}

export interface RealtimeSynchronizationState {
  buildingId?: string;
  connectionState: RealtimeConnectionState;
  bootstrapStatus: TwinBootstrapStatus;
  dataState: 'loading' | 'ready' | 'empty' | 'degraded';
  dittoHttpState?: 'connecting' | 'live' | 'degraded';
  dittoLiveState?: RealtimeConnectionState;
  frontendRealtimeState?: RealtimeConnectionState;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  staleThresholdMs: number;
  activeSessions?: number;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  outOfScopeEventsRejected: number;
  malformedEventsRejected: number;
  hydrationFailures?: number;
  normalizationFailures?: number;
  commandPolicyRejections?: number;
  lastFailureReason?: string;
}
