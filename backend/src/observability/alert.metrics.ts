import { incrementMetric } from './metrics.js';

export function recordAlertRaised(): void {
  incrementMetric('alert_raised_total');
}

export function recordAlertAcknowledged(): void {
  incrementMetric('alert_acknowledged_total');
}
