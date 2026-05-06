export type ElevatorCommandType =
  | 'call_floor'
  | 'set_service_mode'
  | 'clear_fault'
  | 'lock_elevator'
  | 'unlock_elevator'
  | 'simulate_event'
  | 'move_to_floor'
  | 'stop'
  | 'reset';

export type CommandLifecycleStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'executing'
  | 'succeeded'
  | 'failed'
  | 'timed_out'
  | 'in_progress'
  | 'completed'
  | 'expired';

export interface ControlCommand {
  commandId: string;
  elevatorId: string;
  buildingId?: string;
  commandType: ElevatorCommandType;
  requestedFloor?: number;
  parameters?: Record<string, unknown>;
  status: CommandLifecycleStatus;
  policyDecision?: 'allowed' | 'rejected';
  correlationId: string;
  updatedAt: string;
  message: string;
}
