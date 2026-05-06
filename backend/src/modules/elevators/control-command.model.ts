import type { ControlCommand } from '../../contracts/command.js';

export function createControlCommand(
  input: Omit<ControlCommand, 'commandId' | 'correlationId' | 'status' | 'message' | 'updatedAt'> &
    Partial<Pick<ControlCommand, 'status' | 'message'>>
): ControlCommand {
  const updatedAt = new Date().toISOString();
  return {
    ...input,
    commandId: `cmd-${input.elevatorId}-${Date.now()}`,
    correlationId: `corr-${input.elevatorId}-${Date.now()}`,
    updatedAt,
    status: input.status ?? 'accepted',
    policyDecision: input.status === 'rejected' ? 'rejected' : 'allowed',
    message: input.message ?? 'Command accepted for processing'
  };
}
