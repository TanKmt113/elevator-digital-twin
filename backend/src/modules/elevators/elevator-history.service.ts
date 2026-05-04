import { HistoricalTelemetryRepository } from './historical-telemetry.repository.js';

export class ElevatorHistoryService {
  constructor(private readonly repository = new HistoricalTelemetryRepository()) {}

  record(point: Parameters<HistoricalTelemetryRepository['append']>[0]) {
    return this.repository.append(point);
  }

  query(elevatorId: string, from: string, to: string) {
    return this.repository.query(elevatorId, from, to);
  }
}
