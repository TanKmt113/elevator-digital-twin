import { create } from 'zustand';

export interface ElevatorViewModel {
  elevatorId: string;
  status: string;
  currentFloor: number;
  direction: string;
  doorState: string;
  loadPercentage?: number;
  healthState: string;
  stale: boolean;
}

interface ElevatorStoreState {
  elevators: Record<string, ElevatorViewModel>;
  upsertElevator: (elevator: ElevatorViewModel) => void;
}

export const useElevatorStore = create<ElevatorStoreState>((set) => ({
  elevators: {},
  upsertElevator: (elevator) =>
    set((state) => ({
      elevators: {
        ...state.elevators,
        [elevator.elevatorId]: elevator
      }
    }))
}));
