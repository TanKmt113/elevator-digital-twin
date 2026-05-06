import { create } from 'zustand';
import type { ElevatorViewModel } from './elevator-store';

export interface HistoryPoint {
  recordedAt: string;
  capturedAt?: string;
  currentFloor?: number;
  direction?: string;
  doorState?: string;
  positionMeters?: number;
  doorOpenPercent?: number;
  loadPercentage?: number;
  tripCount?: number;
  partial?: boolean;
  missingFields?: string[];
}

interface HistoryMeta {
  from?: string;
  to?: string;
  resolution?: string;
  partial?: boolean;
}

interface HistoryStoreState {
  historyByElevator: Record<string, HistoryPoint[]>;
  metaByElevator: Record<string, HistoryMeta>;
  playbackElevatorId?: string;
  playbackProjectionByElevator: Record<string, ElevatorViewModel>;
  setHistory: (elevatorId: string, points: HistoryPoint[]) => void;
  setHistoryMeta: (elevatorId: string, meta: HistoryMeta) => void;
  setPlaybackElevator: (elevatorId?: string) => void;
  setPlaybackProjection: (elevatorId: string, projection: ElevatorViewModel) => void;
}

export const useHistoryStore = create<HistoryStoreState>((set) => ({
  historyByElevator: {},
  metaByElevator: {},
  playbackElevatorId: undefined,
  playbackProjectionByElevator: {},
  setHistory: (elevatorId, points) =>
    set((state) => ({
      historyByElevator: {
        ...state.historyByElevator,
        [elevatorId]: points
      }
    })),
  setHistoryMeta: (elevatorId, meta) =>
    set((state) => ({
      metaByElevator: {
        ...state.metaByElevator,
        [elevatorId]: meta
      }
    })),
  setPlaybackElevator: (playbackElevatorId) => set({ playbackElevatorId }),
  setPlaybackProjection: (elevatorId, projection) =>
    set((state) => ({
      playbackProjectionByElevator: {
        ...state.playbackProjectionByElevator,
        [elevatorId]: projection
      }
    }))
}));
