import { incrementMetric } from './metrics.js';

export function recordRiskPublished(): void {
  incrementMetric('risk_warning_published_total');
}

export function recordRiskIngested(): void {
  incrementMetric('risk_warning_ingested_total');
}

export function recordRiskRejected(): void {
  incrementMetric('risk_warning_rejected_total');
}
