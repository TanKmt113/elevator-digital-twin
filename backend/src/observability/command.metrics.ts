import { incrementMetric } from './metrics.js';

export function recordCommandAccepted(): void {
  incrementMetric('command_accepted_total');
}

export function recordCommandRejected(): void {
  incrementMetric('command_rejected_total');
}
