import { create } from 'zustand';

export interface ElevatorViewModel {
  elevatorId: string;
  buildingId?: string;
  status: string;
  currentFloor: number;
  targetFloor?: number;
  direction: string;
  doorState: string;
  loadPercentage?: number;
  healthState: string;
  stale: boolean;
}

interface ElevatorStoreState {
  elevators: Record<string, ElevatorViewModel>;
  selectedBuildingId: string;
  selectedElevatorId?: string;
  selectionSource?: 'list' | 'detail' | '3d' | 'system';
  selectedAt?: string;
  upsertElevator: (elevator: ElevatorViewModel) => void;
  selectElevator: (
    elevatorId: string | undefined,
    source: 'list' | 'detail' | '3d' | 'system',
    buildingId?: string
  ) => void;
}

export const useElevatorStore = create<ElevatorStoreState>((set) => ({
  elevators: {},
  selectedBuildingId: 'L72',
  selectedElevatorId: undefined,
  selectionSource: undefined,
  selectedAt: undefined,
  upsertElevator: (elevator) =>
    set((state) => ({
      elevators: {
        ...state.elevators,
        [elevator.elevatorId]: elevator
      }
    })),
  selectElevator: (selectedElevatorId, selectionSource, buildingId) =>
    set((state) => ({
      selectedBuildingId: buildingId ?? state.selectedBuildingId,
      selectedElevatorId,
      selectionSource,
      selectedAt: selectedElevatorId ? new Date().toISOString() : undefined
    }))
}));
