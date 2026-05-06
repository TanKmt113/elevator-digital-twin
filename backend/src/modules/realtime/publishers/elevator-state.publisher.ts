import type { ElevatorTwin } from '../../../contracts/elevator.js';
import { normalizeElevatorState, type NormalizedEvent } from '../event-normalizer.js';
import { RealtimeSessionManager } from '../ws-server.js';
import { recordElevatorStatePublished } from '../../../observability/elevator-monitoring.metrics.js';

export class ElevatorStatePublisher {
  constructor(private readonly sessions: RealtimeSessionManager) {}

  publish(twin: ElevatorTwin): void {
    recordElevatorStatePublished();
    this.sessions.publish(normalizeElevatorState(twin));
  }

  publishEvent(event: NormalizedEvent<ElevatorTwin>): void {
    recordElevatorStatePublished();
    this.sessions.publish(event);
  }
}
