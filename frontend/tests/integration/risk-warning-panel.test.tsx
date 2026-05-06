import { describe, expect, it } from 'vitest';
import {
  deriveRiskDriverLabel,
  deriveRiskLevelLabel,
  deriveRiskVerificationState
} from '../../src/modules/analytics/components/RiskWarningPanel';
import { useRiskStore } from '../../src/store/risk-store';
import { structuredRiskWarningFixture } from '../fixtures/risk-warning.fixtures';

describe('risk warning panel state', () => {
  it('stores predictive warnings with model metadata for rendering', () => {
    useRiskStore.getState().upsertWarning({
      riskWarningId: 'r1',
      elevatorId: 'E1',
      riskLevel: 'high',
      predictedWindowHours: 48,
      generatedAt: new Date().toISOString(),
      modelVersion: 'model-v2',
      validationRunId: 'validation-001',
      verificationStatus: 'verified'
    });
    expect(useRiskStore.getState().warnings.r1?.riskLevel).toBe('high');
    expect(useRiskStore.getState().warnings.r1?.modelVersion).toBe('model-v2');
    expect(deriveRiskVerificationState(useRiskStore.getState().warnings.r1).label).toBe('Đã xác minh');
  });

  it('marks warnings without model metadata as unverified', () => {
    expect(
      deriveRiskVerificationState({
        riskWarningId: 'r2',
        elevatorId: 'E2',
        riskLevel: 'moderate',
        predictedWindowHours: 96,
        generatedAt: new Date().toISOString()
      }).label
    ).toBe('Chưa xác minh');
  });

  it('derives Vietnamese labels for structured drivers and risk levels', () => {
    useRiskStore.getState().upsertWarning(structuredRiskWarningFixture);

    const warning = useRiskStore.getState().warnings[structuredRiskWarningFixture.riskWarningId];
    expect(deriveRiskLevelLabel(warning?.riskLevel)).toBe('Tới hạn');
    expect(deriveRiskDriverLabel(warning?.drivers?.[0])).toBe('Phát hiện kẹt cửa');
  });
});
