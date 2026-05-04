import { describe, expect, it } from 'vitest';
import { useRiskStore } from '../../src/store/risk-store';

describe('risk warning panel state', () => {
  it('stores predictive warnings for rendering', () => {
    useRiskStore.getState().upsertWarning({
      riskWarningId: 'r1',
      elevatorId: 'E1',
      riskLevel: 'high',
      predictedWindowHours: 48,
      generatedAt: new Date().toISOString()
    });
    expect(useRiskStore.getState().warnings.r1?.riskLevel).toBe('high');
  });
});
