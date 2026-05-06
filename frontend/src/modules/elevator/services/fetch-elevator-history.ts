import { apiGet } from '../../../services/api/client';
import { useElevatorStore } from '../../../store/elevator-store';
import { useHistoryStore } from '../../../store/history-store';
import type { HistoryPoint } from '../../../store/history-store';

interface PlaybackSnapshotResponse {
  items: Array<{
    capturedAt: string;
    partial: boolean;
    missingFields: string[];
    twin: HistoryPoint;
  }>;
  meta: {
    from: string;
    to: string;
    resolution: string;
    partial: boolean;
  };
}

interface FetchElevatorHistoryOptions {
  buildingId?: string;
  from?: string;
  to?: string;
  resolution?: string;
  token?: string;
}

export async function fetchElevatorHistory(
  elevatorId: string,
  options: FetchElevatorHistoryOptions = {}
): Promise<HistoryPoint[]> {
  if (options.buildingId && options.token) {
    const query = new URLSearchParams({
      buildingId: options.buildingId,
      from: options.from ?? new Date(Date.now() - 5 * 60_000).toISOString(),
      to: options.to ?? new Date().toISOString(),
      resolution: options.resolution ?? '1s'
    });
    const response = await apiGet<PlaybackSnapshotResponse>(
      `/elevators/${encodeURIComponent(elevatorId)}/history?${query.toString()}`,
      options.token
    );
    const points = response.items.map((item) => ({
      ...item.twin,
      recordedAt: item.twin.recordedAt ?? item.capturedAt,
      capturedAt: item.capturedAt,
      partial: item.partial,
      missingFields: item.missingFields
    }));
    useHistoryStore.getState().setHistory(elevatorId, points);
    useHistoryStore.getState().setHistoryMeta(elevatorId, response.meta);
    useHistoryStore.getState().setPlaybackElevator(elevatorId);
    updatePlaybackProjection(elevatorId, points[0]);
    return points;
  }

  const points: HistoryPoint[] = [
    {
      recordedAt: new Date().toISOString(),
      currentFloor: 10,
      tripCount: 24,
      partial: false,
      missingFields: []
    }
  ];
  useHistoryStore.getState().setHistory(elevatorId, points);
  useHistoryStore.getState().setHistoryMeta(elevatorId, { partial: false, resolution: 'local' });
  useHistoryStore.getState().setPlaybackElevator(elevatorId);
  updatePlaybackProjection(elevatorId, points[0]);
  return points;
}

function updatePlaybackProjection(elevatorId: string, point: HistoryPoint | undefined): void {
  const live = useElevatorStore.getState().elevators[elevatorId];
  if (!live || !point) {
    return;
  }

  useHistoryStore.getState().setPlaybackProjection(elevatorId, {
    ...live,
    currentFloor: point.currentFloor ?? live.currentFloor,
    direction: point.direction ?? live.direction,
    doorState: point.doorState ?? live.doorState,
    positionMeters: point.positionMeters ?? live.positionMeters,
    doorOpenPercent: point.doorOpenPercent ?? live.doorOpenPercent,
    loadPercentage: point.loadPercentage ?? live.loadPercentage,
    lastEventAt: point.recordedAt ?? point.capturedAt ?? live.lastEventAt,
    isPlayback: true
  });
}
