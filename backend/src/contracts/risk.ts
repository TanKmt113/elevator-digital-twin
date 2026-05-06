export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskDriver {
  driverId: string;
  label: string;
  signal: string;
  observedValue: string | number | boolean;
  threshold?: string | number | boolean;
  severityContribution: RiskLevel;
}

export interface RiskWarning {
  riskWarningId: string;
  elevatorId: string;
  buildingId?: string;
  riskType?: string;
  riskLevel: RiskLevel;
  predictedWindowHours: number;
  generatedAt: string;
  drivers?: Array<string | RiskDriver>;
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

export interface AnalyticsValidationState {
  validationRunId: string;
  elevatorId?: string;
  modelVersion: string;
  status: 'pending' | 'passed' | 'failed';
  riskWarningId?: string;
  completedAt?: string;
  failureStage?: 'feature_generation' | 'prediction' | 'backend_ingestion' | 'dashboard_render';
}

export interface RiskAnalyticsReadiness {
  status: 'ready' | 'degraded';
  acceptedWarnings: number;
  rejectedWarnings: number;
  suppressedWarnings?: number;
  lastModelVersion?: string;
  lastFailureReason?: string;
}
