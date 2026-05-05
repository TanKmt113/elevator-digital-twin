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
  replaceElevators: (elevators: ElevatorViewModel[], buildingId?: string) => void;
  selectElevator: (
    elevatorId: string | undefined,
    source: 'list' | 'detail' | '3d' | 'system',
    buildingId?: string
  ) => void;
}

function getDefaultBuildingId(): string {
  return import.meta.env.VITE_BUILDING_ID ?? 'L72';
}

export const useElevatorStore = create<ElevatorStoreState>((set) => ({
  elevators: {},
  selectedBuildingId: getDefaultBuildingId(),
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
  replaceElevators: (elevators, buildingId) =>
    set((state) => {
      const nextElevators = Object.fromEntries(elevators.map((elevator) => [elevator.elevatorId, elevator]));
      const selectedElevatorId = state.selectedElevatorId && nextElevators[state.selectedElevatorId] ? state.selectedElevatorId : undefined;

      return {
        elevators: nextElevators,
        selectedBuildingId: buildingId ?? state.selectedBuildingId,
        selectedElevatorId,
        selectionSource: selectedElevatorId ? state.selectionSource : undefined,
        selectedAt: selectedElevatorId ? state.selectedAt : undefined
      };
    }),
  selectElevator: (selectedElevatorId, selectionSource, buildingId) =>
    set((state) => ({
      selectedBuildingId: buildingId ?? state.selectedBuildingId,
      selectedElevatorId,
      selectionSource,
      selectedAt: selectedElevatorId ? new Date().toISOString() : undefined
    }))
}));
