export interface RiskWarning {
  riskWarningId: string;
  elevatorId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  predictedWindowHours: number;
  generatedAt: string;
  drivers?: string[];
  modelVersion?: string;
  status?: 'active' | 'dismissed' | 'expired';
}

export interface AnalyticsValidationState {
  validationRunId: string;
  modelVersion: string;
  status: 'pending' | 'passed' | 'failed';
  completedAt?: string;
  failureStage?: 'feature_generation' | 'prediction' | 'backend_ingestion' | 'dashboard_render';
}
