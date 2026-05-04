import { describe, expect, it } from 'vitest';
import { readMetric } from '../../src/observability/metrics.js';
import { RiskAnalyticsService } from '../../src/modules/analytics/risk-analytics.service.js';

describe('risk warning ingestion', () => {
  it('stores ingested risk warnings with analytics traceability', () => {
    const service = new RiskAnalyticsService();
    service.ingest({
      riskWarningId: 'r1',
      elevatorId: 'E1',
      riskLevel: 'high',
      predictedWindowHours: 48,
      generatedAt: new Date().toISOString(),
      drivers: ['temperature', 'vibration'],
      modelVersion: 'model-v2',
      validationRunId: 'validation-001',
      modelTrace: {
        featureSet: 'elevator-phase2-risk',
        scoredAt: new Date().toISOString(),
        validationStatus: 'passed'
      }
    });
    expect(service.list()[0]?.modelVersion).toBe('model-v2');
    expect(service.readiness().status).toBe('ready');
    expect(service.readiness().lastModelVersion).toBe('model-v2');
    expect(readMetric('risk_warning_ingested_total')).toBeGreaterThan(0);
  });

  it('rejects warnings without model trace fields and reports degraded readiness', () => {
    const service = new RiskAnalyticsService();

    expect(() =>
      service.ingest({
        riskWarningId: 'r2',
        elevatorId: 'E2',
        riskLevel: 'moderate',
        predictedWindowHours: 96,
        generatedAt: new Date().toISOString()
      })
    ).toThrow(/modelVersion/);

    expect(service.readiness().status).toBe('degraded');
    expect(service.readiness().lastFailureReason).toContain('modelVersion');
  });
});
