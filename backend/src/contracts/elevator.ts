export type ElevatorStatus =
  | 'idle'
  | 'moving'
  | 'door_open'
  | 'maintenance'
  | 'fault'
  | 'offline';

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
