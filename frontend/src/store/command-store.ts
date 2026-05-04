interface ControlCommand {
  commandId: string;
  correlationId: string;
  elevatorId: string;
  commandType: 'move_to_floor' | 'stop' | 'reset';
  requestedFloor?: number;
  status: 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'failed' | 'expired';
  message: string;
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
