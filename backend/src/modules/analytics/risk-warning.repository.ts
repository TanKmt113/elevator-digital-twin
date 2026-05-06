import type { RiskWarning } from '../../contracts/risk.js';

export class RiskWarningRepository {
  private readonly warnings = new Map<string, RiskWarning>();

  save(warning: RiskWarning): RiskWarning {
    this.warnings.set(warning.riskWarningId, warning);
    return warning;
  }

  list(): RiskWarning[] {
    return [...this.warnings.values()];
  }

  upsertActive(warning: RiskWarning): { warning: RiskWarning; suppressed: boolean } {
    const existing = this.warnings.get(warning.riskWarningId);
    if (!existing || existing.status !== 'active') {
      this.save(warning);
      return { warning, suppressed: false };
    }

    const existingRank = this.riskRank(existing.riskLevel);
    const nextRank = this.riskRank(warning.riskLevel);
    if (nextRank <= existingRank) {
      const suppressed = {
        ...existing,
        updatedAt: warning.generatedAt,
        suppressedCount: (existing.suppressedCount ?? 0) + 1
      };
      this.save(suppressed);
      return { warning: suppressed, suppressed: true };
    }

    const escalated = {
      ...existing,
      ...warning,
      generatedAt: existing.generatedAt,
      updatedAt: warning.generatedAt,
      suppressedCount: existing.suppressedCount
    };
    this.save(escalated);
    return { warning: escalated, suppressed: false };
  }

  private riskRank(level: RiskWarning['riskLevel']): number {
    return {
      low: 1,
      moderate: 2,
      high: 3,
      critical: 4
    }[level];
  }
}
