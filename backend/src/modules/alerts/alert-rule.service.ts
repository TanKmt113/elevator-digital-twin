import type { AlertRecord } from '../../contracts/alert.js';

export class AlertRuleService {
  apply(alert: AlertRecord): AlertRecord {
    if (alert.alertType === 'motor_overheating') {
      return { ...alert, severity: 'critical' };
    }
    return alert;
  }
}
