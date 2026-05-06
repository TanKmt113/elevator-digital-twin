interface ControlCommand {
  commandId: string;
  correlationId: string;
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
  status: 'pending' | 'accepted' | 'rejected' | 'executing' | 'succeeded' | 'failed' | 'timed_out' | 'in_progress' | 'completed' | 'expired';
  policyDecision?: 'allowed' | 'rejected';
  updatedAt?: string;
  message: string;
  simulated?: boolean;
}

import { create } from 'zustand';

interface CommandStoreState {
  commands: Record<string, ControlCommand>;
  upsertCommand: (command: ControlCommand) => void;
}

export const useCommandStore = create<CommandStoreState>((set) => ({
  commands: {},
  upsertCommand: (command) =>
    set((state) => ({
      commands: {
        ...state.commands,
        [command.commandId]: command
      }
    }))
}));
