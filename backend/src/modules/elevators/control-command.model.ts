import type { ControlCommand } from '../../contracts/command.js';

export function createControlCommand(
  input: Omit<ControlCommand, 'commandId' | 'correlationId' | 'status' | 'message'> &
    Partial<Pick<ControlCommand, 'status' | 'message'>>
): ControlCommand {
  return {
    commandId: `cmd-${input.elevatorId}-${Date.now()}`,
    correlationId: `corr-${input.elevatorId}-${Date.now()}`,
    status: input.status ?? 'accepted',
    message: input.message ?? 'Command accepted for processing',
    ...input
  };
}
