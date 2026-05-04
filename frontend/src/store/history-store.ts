import { create } from 'zustand';

export interface HistoryPoint {
  recordedAt: string;
  currentFloor?: number;
  direction?: string;
  doorState?: string;
  loadPercentage?: number;
  tripCount?: number;
}

interface HistoryStoreState {
  historyByElevator: Record<string, HistoryPoint[]>;
  setHistory: (elevatorId: string, points: HistoryPoint[]) => void;
}

export const useHistoryStore = create<HistoryStoreState>((set) => ({
  historyByElevator: {},
  setHistory: (elevatorId, points) =>
    set((state) => ({
      historyByElevator: {
        ...state.historyByElevator,
        [elevatorId]: points
      }
    }))
}));
