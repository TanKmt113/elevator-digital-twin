import { create } from 'zustand';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskDriverViewModel {
  driverId: string;
  label: string;
  signal: string;
  observedValue: string | number | boolean;
  threshold?: string | number | boolean;
  severityContribution: RiskLevel;
}

export interface RiskWarningViewModel {
  riskWarningId: string;
  elevatorId: string;
  buildingId?: string;
  riskType?: string;
  riskLevel: RiskLevel;
  predictedWindowHours: number;
  generatedAt: string;
  drivers?: Array<string | RiskDriverViewModel>;
  modelVersion?: string;
  validationRunId?: string;
  verificationStatus?: 'verified' | 'unverified' | 'failed';
  modelTrace?: {
    featureSet: string;
    scoredAt: string;
    validationStatus: 'passed' | 'failed';
    ruleIds?: string[];
    inputCoverage?: Record<string, boolean>;
  };
  status?: 'active' | 'dismissed' | 'expired';
  updatedAt?: string;
  suppressedCount?: number;
}

interface RiskStoreState {
  warnings: Record<string, RiskWarningViewModel>;
  upsertWarning: (warning: RiskWarningViewModel) => void;
  replaceWarnings: (warnings: RiskWarningViewModel[]) => void;
}

export const useRiskStore = create<RiskStoreState>((set) => ({
  warnings: {},
  upsertWarning: (warning) =>
    set((state) => ({
      warnings: {
        ...state.warnings,
        [warning.riskWarningId]: warning
      }
    })),
  replaceWarnings: (warnings) =>
    set({
      warnings: Object.fromEntries(warnings.map((warning) => [warning.riskWarningId, warning]))
    })
}));
