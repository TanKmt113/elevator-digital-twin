import { describe, expect, it } from 'vitest';
import { readMetric } from '../../src/observability/metrics.js';
import { RiskAnalyticsService } from '../../src/modules/analytics/risk-analytics.service.js';
import { RiskEngineService } from '../../src/modules/analytics/risk-engine.service.js';
import { doorBlockedRiskInput, riskInput } from '../fixtures/risk-engine.fixtures.js';

describe('risk duplicate suppression', () => {
  it('suppresses equivalent active warnings for the same elevator and risk condition', () => {
    const engine = new RiskEngineService();

    expect(engine.evaluate(doorBlockedRiskInput)).toHaveLength(1);
    expect(engine.evaluate(doorBlockedRiskInput)).toHaveLength(0);
    expect(readMetric('risk_warning_suppressed_total')).toBeGreaterThan(0);
  });

  it('reports suppressed warnings in analytics readiness', () => {
    const analytics = new RiskAnalyticsService();
    const engine = new RiskEngineService();
    const warning = engine.evaluate(doorBlockedRiskInput)[0];

    if (!warning) {
      throw new Error('Expected first door warning');
    }

    analytics.ingest(warning);
    analytics.ingest({
      ...warning,
      generatedAt: '2026-05-06T10:01:00.000Z'
    });

    expect(analytics.readiness()).toMatchObject({
      status: 'ready',
      acceptedWarnings: 1,
      suppressedWarnings: 1
    });
  });

  it('keeps readiness degraded after persistence validation failure', () => {
    const analytics = new RiskAnalyticsService();

    expect(() =>
      analytics.ingest({
        riskWarningId: 'invalid',
        elevatorId: 'org.example:L72-ELEV-A',
        riskLevel: 'high',
        predictedWindowHours: 12,
        generatedAt: 'not-a-date',
        drivers: ['door'],
        modelVersion: 'risk-rules-v1',
        validationRunId: 'risk-engine-v1',
        modelTrace: {
          featureSet: 'risk-rule-engine-v1',
          scoredAt: '2026-05-06T10:00:00.000Z',
          validationStatus: 'passed'
        }
      })
    ).toThrow(/generatedAt/);

    expect(analytics.readiness().status).toBe('degraded');
  });

  it('emits escalation when a duplicate condition worsens', () => {
    const engine = new RiskEngineService();

    expect(engine.evaluate(riskInput({ doorState: 'blocked' }))[0]?.riskLevel).toBe('high');
    expect(engine.evaluate(riskInput({ doorState: 'blocked', healthState: 'critical' }))[0]?.riskLevel).toBe('critical');
  });
});
