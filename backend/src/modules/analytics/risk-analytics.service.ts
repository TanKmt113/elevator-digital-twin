import type { RiskAnalyticsReadiness, RiskWarning } from '../../contracts/risk.js';
import { recordRiskIngested, recordRiskRejected, recordRiskSuppressed } from '../../observability/risk.metrics.js';
import { RiskWarningRepository } from './risk-warning.repository.js';

export class RiskAnalyticsService {
  private acceptedWarnings = 0;
  private rejectedWarnings = 0;
  private suppressedWarnings = 0;
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
      drivers: this.normalizeDrivers(warning),
      status: warning.status ?? 'active',
      verificationStatus: warning.verificationStatus ?? 'verified'
    };
    const saved = this.repository.upsertActive(normalized);
    if (saved.suppressed) {
      this.suppressedWarnings += 1;
      recordRiskSuppressed();
    } else {
      this.acceptedWarnings += 1;
      recordRiskIngested();
    }
    this.lastModelVersion = normalized.modelVersion;
    this.lastFailureReason = undefined;
    return saved.warning;
  }

  list(): RiskWarning[] {
    return this.repository.list();
  }

  readiness(): RiskAnalyticsReadiness {
    return {
      status: this.lastFailureReason ? 'degraded' : 'ready',
      acceptedWarnings: this.acceptedWarnings,
      rejectedWarnings: this.rejectedWarnings,
      suppressedWarnings: this.suppressedWarnings,
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

    if (!warning.drivers?.length) {
      return 'Risk warning rejected: at least one risk driver is required.';
    }

    if (Number.isNaN(Date.parse(warning.generatedAt))) {
      return 'Risk warning rejected: generatedAt must be an ISO timestamp.';
    }

    return undefined;
  }

  private normalizeDrivers(warning: RiskWarning): RiskWarning['drivers'] {
    return warning.drivers?.map((driver) => {
      if (typeof driver === 'string') {
        return driver;
      }

      return {
        ...driver,
        label: driver.label.trim() || driver.driverId
      };
    });
  }
}
