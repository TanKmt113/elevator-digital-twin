import { useCommandStore } from '../../../store/command-store';

interface SubmitCommandInput {
  elevatorId: string;
  commandType: 'move_to_floor' | 'stop' | 'reset';
  requestedFloor?: number;
}

export async function submitCommand(input: SubmitCommandInput) {
  const command = {
    commandId: `cmd-ui-${input.elevatorId}-${Date.now()}`,
    correlationId: `corr-ui-${input.elevatorId}-${Date.now()}`,
    elevatorId: input.elevatorId,
    commandType: input.commandType,
    requestedFloor: input.requestedFloor,
    status: 'accepted' as const,
    message: 'Command submitted from UI'
  };
  useCommandStore.getState().upsertCommand(command);
  return command;
}
