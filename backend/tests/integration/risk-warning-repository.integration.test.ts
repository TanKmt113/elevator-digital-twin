import { describe, expect, it } from 'vitest';
import type { RiskWarning } from '../../src/contracts/risk.js';
import { RiskWarningRepository } from '../../src/modules/analytics/risk-warning.repository.js';

function warning(overrides: Partial<RiskWarning> = {}): RiskWarning {
  return {
    riskWarningId: 'risk-org.example:L72-ELEV-A-door',
    elevatorId: 'org.example:L72-ELEV-A',
    riskType: 'door',
    riskLevel: 'high',
    predictedWindowHours: 12,
    generatedAt: '2026-05-06T10:00:00.000Z',
    drivers: ['door'],
    modelVersion: 'risk-rules-v1',
    validationRunId: 'risk-engine-v1',
    modelTrace: {
      featureSet: 'risk-rule-engine-v1',
      scoredAt: '2026-05-06T10:00:00.000Z',
      validationStatus: 'passed'
    },
    status: 'active',
    ...overrides
  };
}

describe('risk warning repository escalation', () => {
  it('suppresses same-or-lower severity active warnings', () => {
    const repository = new RiskWarningRepository();

    expect(repository.upsertActive(warning()).suppressed).toBe(false);
    expect(repository.upsertActive(warning({ generatedAt: '2026-05-06T10:01:00.000Z' })).suppressed).toBe(true);
    expect(repository.list()[0]?.suppressedCount).toBe(1);
  });

  it('updates active warning when severity escalates', () => {
    const repository = new RiskWarningRepository();

    repository.upsertActive(warning({ riskLevel: 'high' }));
    const result = repository.upsertActive(
      warning({
        riskLevel: 'critical',
        generatedAt: '2026-05-06T10:02:00.000Z'
      })
    );

    expect(result.suppressed).toBe(false);
    expect(result.warning).toMatchObject({
      riskLevel: 'critical',
      generatedAt: '2026-05-06T10:00:00.000Z',
      updatedAt: '2026-05-06T10:02:00.000Z'
    });
  });
});
