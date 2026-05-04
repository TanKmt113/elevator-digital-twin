export interface RiskWarning {
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
  status?: 'active' | 'dismissed' | 'expired';
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
  lastModelVersion?: string;
  lastFailureReason?: string;
}
