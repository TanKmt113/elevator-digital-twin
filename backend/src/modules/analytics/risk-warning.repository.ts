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
}
