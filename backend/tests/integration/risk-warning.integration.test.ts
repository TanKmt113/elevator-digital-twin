import { describe, expect, it } from 'vitest';
import { RiskAnalyticsService } from '../../src/modules/analytics/risk-analytics.service.js';

describe('risk warning ingestion', () => {
  it('stores ingested risk warnings', () => {
    const service = new RiskAnalyticsService();
    service.ingest({
      riskWarningId: 'r1',
      elevatorId: 'E1',
      riskLevel: 'high',
      predictedWindowHours: 48,
      generatedAt: new Date().toISOString(),
      drivers: ['temperature', 'vibration']
    });
    expect(service.list()).toHaveLength(1);
  });
});
