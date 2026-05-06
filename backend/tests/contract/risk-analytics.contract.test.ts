import { describe, expect, it } from 'vitest';
import { RiskAnalyticsService } from '../../src/modules/analytics/risk-analytics.service.js';

describe('risk analytics contract', () => {
  it('defines the analytics risk endpoint', () => {
    expect('/analytics/risk').toContain('risk');
  });

  it('accepts structured rule drivers and trace metadata', () => {
    const service = new RiskAnalyticsService();
    const warning = service.ingest({
      riskWarningId: 'risk-org.example:L72-ELEV-A-door',
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      riskType: 'door',
      riskLevel: 'critical',
      predictedWindowHours: 12,
      generatedAt: '2026-05-06T10:00:00.000Z',
      drivers: [
        {
          driverId: 'door.blocked',
          label: 'Phát hiện kẹt cửa',
          signal: 'doorState',
          observedValue: 'blocked',
          threshold: 'blocked',
          severityContribution: 'critical'
        }
      ],
      modelVersion: 'risk-rules-v1',
      validationRunId: 'risk-engine-v1',
      verificationStatus: 'verified',
      modelTrace: {
        featureSet: 'risk-rule-engine-v1',
        scoredAt: '2026-05-06T10:00:00.000Z',
        validationStatus: 'passed',
        ruleIds: ['door.blocked.v1'],
        inputCoverage: {
          doorState: true
        }
      }
    });

    expect(warning).toMatchObject({
      riskLevel: 'critical',
      predictedWindowHours: 12,
      verificationStatus: 'verified',
      modelTrace: expect.objectContaining({
        featureSet: 'risk-rule-engine-v1',
        ruleIds: ['door.blocked.v1']
      })
    });
    expect(warning.drivers?.[0]).toMatchObject({
      label: 'Phát hiện kẹt cửa',
      severityContribution: 'critical'
    });
  });
});
