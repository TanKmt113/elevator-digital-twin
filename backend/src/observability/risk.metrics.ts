import { incrementMetric } from './metrics.js';

export function recordRiskPublished(): void {
  incrementMetric('risk_warning_published_total');
}
