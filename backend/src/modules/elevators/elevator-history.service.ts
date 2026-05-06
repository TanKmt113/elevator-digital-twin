import { HistoricalTelemetryRepository } from './historical-telemetry.repository.js';
import type { HistoricalTelemetryPoint } from './historical-telemetry.repository.js';

interface PlaybackSnapshot {
  snapshotId: string;
  elevatorId: string;
  buildingId: string;
  capturedAt: string;
  partial: boolean;
  missingFields: string[];
  twin: HistoricalTelemetryPoint & { buildingId: string };
  source: 'history';
}

export class ElevatorHistoryService {
  constructor(private readonly repository = new HistoricalTelemetryRepository()) {}

  record(point: Parameters<HistoricalTelemetryRepository['append']>[0]) {
    return this.repository.append(point);
  }

  query(elevatorId: string, from: string, to: string) {
    return this.repository.query(elevatorId, from, to);
  }

  queryPlayback(
    elevatorId: string,
    buildingId: string,
    from: string,
    to: string,
    resolution = '1s'
  ): {
    items: PlaybackSnapshot[];
    meta: { from: string; to: string; resolution: string; partial: boolean };
  } {
    const items = this.query(elevatorId, from, to).map((point) =>
      this.toPlaybackSnapshot(point, buildingId)
    );

    return {
      items,
      meta: {
        from,
        to,
        resolution,
        partial: items.some((item) => item.partial)
      }
    };
  }

  private toPlaybackSnapshot(point: HistoricalTelemetryPoint, buildingId: string): PlaybackSnapshot {
    const scopedBuildingId = point.buildingId ?? buildingId;
    const missingFields = ['currentFloor', 'positionMeters', 'doorOpenPercent', 'loadPercentage']
      .filter((field) => point[field as keyof HistoricalTelemetryPoint] === undefined);

    return {
      snapshotId: `hist-${point.elevatorId}-${point.recordedAt}`,
      elevatorId: point.elevatorId,
      buildingId: scopedBuildingId,
      capturedAt: point.recordedAt,
      partial: missingFields.length > 0,
      missingFields,
      source: 'history',
      twin: {
        ...point,
        buildingId: scopedBuildingId
      }
    };
  }
}
