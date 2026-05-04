import { create } from 'zustand';

export interface RiskWarningViewModel {
  riskWarningId: string;
  elevatorId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  predictedWindowHours: number;
  generatedAt: string;
  drivers?: string[];
  modelVersion?: string;
  validationRunId?: string;
  verificationStatus?: 'verified' | 'unverified' | 'failed';
  modelTrace?: {
    featureSet: string;
    scoredAt: string;
    validationStatus: 'passed' | 'failed';
  };
}

interface RiskStoreState {
  warnings: Record<string, RiskWarningViewModel>;
  upsertWarning: (warning: RiskWarningViewModel) => void;
}

export const useRiskStore = create<RiskStoreState>((set) => ({
  warnings: {},
  upsertWarning: (warning) =>
    set((state) => ({
      warnings: {
        ...state.warnings,
        [warning.riskWarningId]: warning
      }
    }))
}));
