export interface HistoricalTelemetryPoint {
  elevatorId: string;
  buildingId?: string;
  recordedAt: string;
  currentFloor?: number;
  direction?: string;
  doorState?: string;
  positionMeters?: number;
  speedMps?: number;
  doorOpenPercent?: number;
  loadKg?: number;
  loadPercentage?: number;
  tripCount?: number;
}

export class HistoricalTelemetryRepository {
  private readonly points: HistoricalTelemetryPoint[] = [];

  append(point: HistoricalTelemetryPoint): HistoricalTelemetryPoint {
    this.points.push(point);
    return point;
  }

  query(elevatorId: string, from: string, to: string): HistoricalTelemetryPoint[] {
    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();
    return this.points.filter((point) => {
      const ts = new Date(point.recordedAt).getTime();
      return point.elevatorId === elevatorId && ts >= fromMs && ts <= toMs;
    });
  }
}
