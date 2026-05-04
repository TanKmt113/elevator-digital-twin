import type { RiskWarning } from '../../contracts/risk.js';
import { RiskWarningRepository } from './risk-warning.repository.js';

export class RiskAnalyticsService {
  constructor(private readonly repository = new RiskWarningRepository()) {}

  ingest(warning: RiskWarning): RiskWarning {
    return this.repository.save(warning);
  }

  list(): RiskWarning[] {
    return this.repository.list();
  }
}
