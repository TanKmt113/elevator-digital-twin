import type { ElevatorTwin } from '../../contracts/elevator.js';
import type { ElevatorCommandType } from '../../contracts/command.js';

export interface CommandPolicyDecision {
  allowed: boolean;
  reason?: string;
}

export class CommandPolicyService {
  evaluate(
    twin: ElevatorTwin | undefined,
    commandType: ElevatorCommandType
  ): CommandPolicyDecision {
    if (!twin) {
      return { allowed: false, reason: 'Elevator not found' };
    }

    if (twin.stale) {
      return { allowed: false, reason: 'Command blocked while elevator state is stale' };
    }

    if (twin.status === 'fault' && commandType !== 'clear_fault' && commandType !== 'reset') {
      return {
        allowed: false,
        reason: 'Command blocked while elevator is in severe fault state'
      };
    }

    if (twin.status === 'maintenance' && commandType === 'call_floor') {
      return { allowed: false, reason: 'Passenger call blocked while elevator is in maintenance mode' };
    }

    if (twin.status === 'offline') {
      return { allowed: false, reason: 'Command blocked while elevator is offline' };
    }

    return { allowed: true };
  }
}
