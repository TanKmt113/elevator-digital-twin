import type { ElevatorTwin } from '../../contracts/elevator.js';
import { ElevatorStateRepository } from './elevator-state.repository.js';
import { SessionStalenessPolicy } from '../realtime/session-manager.js';

export class ElevatorMonitoringService {
  constructor(
    private readonly repository = new ElevatorStateRepository(),
    private readonly stalenessPolicy = new SessionStalenessPolicy()
  ) {}

  upsert(twin: ElevatorTwin): ElevatorTwin {
    return this.repository.save({
      ...twin,
      stale: this.stalenessPolicy.isStale(twin.lastEventAt)
    });
  }

  list(): ElevatorTwin[] {
    return this.repository.list().map((twin) => ({
      ...twin,
      stale: this.stalenessPolicy.isStale(twin.lastEventAt)
    }));
  }

  get(elevatorId: string): ElevatorTwin | undefined {
    const twin = this.repository.get(elevatorId);
    return twin
      ? {
          ...twin,
          stale: this.stalenessPolicy.isStale(twin.lastEventAt)
        }
      : undefined;
  }
}
