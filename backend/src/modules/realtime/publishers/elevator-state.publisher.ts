import type { ElevatorTwin } from '../../../contracts/elevator.js';
import { normalizeElevatorState } from '../event-normalizer.js';
import { RealtimeSessionManager } from '../ws-server.js';

export class ElevatorStatePublisher {
  constructor(private readonly sessions: RealtimeSessionManager) {}

  publish(twin: ElevatorTwin): void {
    this.sessions.publish(normalizeElevatorState(twin));
  }
}
