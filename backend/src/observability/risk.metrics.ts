import { incrementMetric } from './metrics.js';

export function recordRiskPublished(): void {
  incrementMetric('risk_warning_published_total');
}

export function recordRiskPublishFailed(): void {
  incrementMetric('risk_warning_publish_failed_total');
}

export function recordRiskEvaluated(): void {
  incrementMetric('risk_evaluation_total');
}

export function recordRiskGenerated(): void {
  incrementMetric('risk_warning_generated_total');
}

export function recordRiskIngested(): void {
  incrementMetric('risk_warning_ingested_total');
}

export function recordRiskRejected(): void {
  incrementMetric('risk_warning_rejected_total');
}

export function recordRiskSuppressed(): void {
  incrementMetric('risk_warning_suppressed_total');
}
