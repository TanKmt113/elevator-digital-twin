import type { AlertRecord } from '../../contracts/alert.js';

export class AlertRepository {
  private readonly alerts = new Map<string, AlertRecord>();

  save(alert: AlertRecord): AlertRecord {
    this.alerts.set(alert.alertId, alert);
    return alert;
  }

  list(): AlertRecord[] {
    return [...this.alerts.values()];
  }

  get(alertId: string): AlertRecord | undefined {
    return this.alerts.get(alertId);
  }
}
