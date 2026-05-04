export interface AlertRecord {
  alertId: string;
  elevatorId: string;
  alertType: 'overload' | 'motor_overheating' | 'stuck_elevator' | 'emergency_stop' | 'predictive_risk';
  severity: 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  message: string;
  createdAt: string;
  acknowledgedAt?: string | null;
}
