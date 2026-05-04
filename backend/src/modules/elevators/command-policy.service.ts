import type { ElevatorTwin } from '../../contracts/elevator.js';

export interface CommandPolicyDecision {
  allowed: boolean;
  reason?: string;
}

export class CommandPolicyService {
  evaluate(
    twin: ElevatorTwin | undefined,
    commandType: 'move_to_floor' | 'stop' | 'reset'
  ): CommandPolicyDecision {
    if (!twin) {
      return { allowed: false, reason: 'Elevator not found' };
    }

    if (twin.status === 'fault' && commandType !== 'reset') {
      return {
        allowed: false,
        reason: 'Command blocked while elevator is in severe fault state'
      };
    }

    if (twin.status === 'offline') {
      return { allowed: false, reason: 'Command blocked while elevator is offline' };
    }

    return { allowed: true };
  }
}
