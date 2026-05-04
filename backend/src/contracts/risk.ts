export interface RiskWarning {
  riskWarningId: string;
  elevatorId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  predictedWindowHours: number;
  generatedAt: string;
  drivers?: string[];
}
