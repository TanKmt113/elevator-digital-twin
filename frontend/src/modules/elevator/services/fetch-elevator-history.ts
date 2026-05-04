import { useHistoryStore } from '../../../store/history-store';

export async function fetchElevatorHistory(elevatorId: string) {
  const points = [
    {
      recordedAt: new Date().toISOString(),
      currentFloor: 10,
      tripCount: 24
    }
  ];
  useHistoryStore.getState().setHistory(elevatorId, points);
  return points;
}
