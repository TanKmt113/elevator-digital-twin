export interface ControlCommand {
  commandId: string;
  elevatorId: string;
  commandType: 'move_to_floor' | 'stop' | 'reset';
  requestedFloor?: number;
  status: 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'failed' | 'expired';
  correlationId: string;
  message: string;
}
