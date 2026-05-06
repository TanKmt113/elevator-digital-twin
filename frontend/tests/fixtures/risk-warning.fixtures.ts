import type { RiskWarningViewModel } from '../../src/store/risk-store';

export const structuredRiskWarningFixture: RiskWarningViewModel = {
  riskWarningId: 'risk-org.example:L72-ELEV-A-door.blocked.v1',
  elevatorId: 'org.example:L72-ELEV-A',
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
    validationStatus: 'passed'
  }
};
