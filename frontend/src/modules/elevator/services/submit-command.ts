import { useCommandStore } from '../../../store/command-store';

interface SubmitCommandInput {
  elevatorId: string;
  buildingId?: string;
  commandType:
    | 'call_floor'
    | 'set_service_mode'
    | 'clear_fault'
    | 'lock_elevator'
    | 'unlock_elevator'
    | 'simulate_event'
    | 'move_to_floor'
    | 'stop'
    | 'reset';
  requestedFloor?: number;
  parameters?: Record<string, unknown>;
}

export async function submitCommand(input: SubmitCommandInput) {
  const command = {
    commandId: `cmd-ui-${input.elevatorId}-${Date.now()}`,
    correlationId: `corr-ui-${input.elevatorId}-${Date.now()}`,
    elevatorId: input.elevatorId,
    buildingId: input.buildingId,
    commandType: input.commandType,
    requestedFloor: input.requestedFloor,
    parameters: input.parameters,
    status: 'accepted' as const,
    policyDecision: 'allowed' as const,
    updatedAt: new Date().toISOString(),
    simulated: true,
    message: 'Command submitted from UI'
  };
  useCommandStore.getState().upsertCommand(command);
  return command;
}
