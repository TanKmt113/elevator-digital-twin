import type { RiskAnalyticsReadiness, RiskWarning } from '../../contracts/risk.js';
import { recordRiskIngested, recordRiskRejected } from '../../observability/risk.metrics.js';
import { RiskWarningRepository } from './risk-warning.repository.js';

export class RiskAnalyticsService {
  private acceptedWarnings = 0;
  private rejectedWarnings = 0;
  private lastModelVersion?: string;
  private lastFailureReason?: string;

  constructor(private readonly repository = new RiskWarningRepository()) {}

  ingest(warning: RiskWarning): RiskWarning {
    const failure = this.validate(warning);
    if (failure) {
      this.rejectedWarnings += 1;
      this.lastFailureReason = failure;
      recordRiskRejected();
      throw new Error(failure);
    }

    const normalized: RiskWarning = {
      ...warning,
      status: warning.status ?? 'active',
      verificationStatus: warning.verificationStatus ?? 'verified'
    };
    this.acceptedWarnings += 1;
    this.lastModelVersion = normalized.modelVersion;
    this.lastFailureReason = undefined;
    recordRiskIngested();
    return this.repository.save(normalized);
  }

  list(): RiskWarning[] {
    return this.repository.list();
  }

  readiness(): RiskAnalyticsReadiness {
    return {
      status: this.lastFailureReason ? 'degraded' : 'ready',
      acceptedWarnings: this.acceptedWarnings,
      rejectedWarnings: this.rejectedWarnings,
      lastModelVersion: this.lastModelVersion,
      lastFailureReason: this.lastFailureReason
    };
  }

  private validate(warning: RiskWarning): string | undefined {
    if (!warning.modelVersion) {
      return 'Risk warning rejected: modelVersion is required for analytics traceability.';
    }

    if (!warning.modelTrace?.featureSet || !warning.modelTrace.scoredAt) {
      return 'Risk warning rejected: modelTrace featureSet and scoredAt are required.';
    }

    if (Number.isNaN(Date.parse(warning.generatedAt))) {
      return 'Risk warning rejected: generatedAt must be an ISO timestamp.';
    }

    return undefined;
  }
}
