import { incrementMetric } from './metrics.js';

export function recordElevatorStatePublished(): void {
  incrementMetric('elevator_state_published_total');
}
