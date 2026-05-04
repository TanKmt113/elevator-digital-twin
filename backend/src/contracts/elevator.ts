export type ElevatorStatus =
  | 'idle'
  | 'moving'
  | 'door_open'
  | 'maintenance'
  | 'fault'
  | 'offline';

export type TwinBootstrapStatus = 'idle' | 'loading' | 'completed' | 'partial' | 'failed';

export type RealtimeConnectionState =
  | 'connecting'
  | 'live'
  | 'stale'
  | 'degraded'
  | 'resyncing';

export interface ElevatorTwin {
  elevatorId: string;
  buildingId: string;
  schemaVersion: '1.0.0';
  deviceType: 'elevator';
  status: ElevatorStatus;
  currentFloor: number;
  targetFloor?: number;
  direction: 'up' | 'down' | 'stationary' | 'unknown';
  doorState: 'open' | 'closed' | 'opening' | 'closing' | 'blocked' | 'unknown';
  loadPercentage?: number;
  healthState: 'normal' | 'warning' | 'critical' | 'unknown';
  lastEventAt: string;
  stale: boolean;
}

export interface TwinBootstrapSnapshot {
  snapshotId: string;
  buildingId: string;
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
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  staleThresholdMs: number;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  lastFailureReason?: string;
}
