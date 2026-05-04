import type { ElevatorTwin } from '../../contracts/elevator.js';

export class ElevatorStateRepository {
  private readonly records = new Map<string, ElevatorTwin>();

  save(twin: ElevatorTwin): ElevatorTwin {
    this.records.set(twin.elevatorId, twin);
    return twin;
  }

  list(): ElevatorTwin[] {
    return [...this.records.values()];
  }

  get(elevatorId: string): ElevatorTwin | undefined {
    return this.records.get(elevatorId);
  }
}
