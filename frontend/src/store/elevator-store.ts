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

export type ElevatorSelectionSource = 'list' | 'detail' | '3d' | 'system';
export type TwinSceneFocusMode = 'overview' | 'selected';
export type TwinCameraTransitionState = 'idle' | 'transitioning';

interface ElevatorStoreState {
  elevators: Record<string, ElevatorViewModel>;
  selectedBuildingId: string;
  selectedElevatorId?: string;
  selectionSource?: ElevatorSelectionSource;
  selectedAt?: string;
  sceneFocusMode: TwinSceneFocusMode;
  cameraTransitionState: TwinCameraTransitionState;
  lastFocusChangeAt?: string;
  upsertElevator: (elevator: ElevatorViewModel) => void;
  replaceElevators: (elevators: ElevatorViewModel[], buildingId?: string) => void;
  selectElevator: (
    elevatorId: string | undefined,
    source: ElevatorSelectionSource,
    buildingId?: string
  ) => void;
  setSceneFocusMode: (mode: TwinSceneFocusMode) => void;
  setCameraTransitionState: (state: TwinCameraTransitionState) => void;
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
  sceneFocusMode: 'overview',
  cameraTransitionState: 'idle',
  lastFocusChangeAt: undefined,
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
        selectedAt: selectedElevatorId ? state.selectedAt : undefined,
        sceneFocusMode: selectedElevatorId ? state.sceneFocusMode : 'overview',
        cameraTransitionState: 'idle',
        lastFocusChangeAt: state.lastFocusChangeAt
      };
    }),
  selectElevator: (selectedElevatorId, selectionSource, buildingId) =>
    set((state) => ({
      selectedBuildingId: buildingId ?? state.selectedBuildingId,
      selectedElevatorId,
      selectionSource,
      selectedAt: selectedElevatorId ? new Date().toISOString() : undefined,
      sceneFocusMode: selectedElevatorId ? 'selected' : 'overview',
      cameraTransitionState: 'transitioning',
      lastFocusChangeAt: new Date().toISOString()
    })),
  setSceneFocusMode: (sceneFocusMode) =>
    set((state) => ({
      sceneFocusMode,
      selectedElevatorId: state.selectedElevatorId,
      cameraTransitionState: 'transitioning',
      lastFocusChangeAt: new Date().toISOString(),
      selectionSource:
        sceneFocusMode === 'overview' && state.selectionSource === undefined
          ? 'system'
          : state.selectionSource
    })),
  setCameraTransitionState: (cameraTransitionState) => set({ cameraTransitionState })
}));
