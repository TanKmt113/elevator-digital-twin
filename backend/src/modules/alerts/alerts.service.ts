import type { AlertRecord } from '../../contracts/alert.js';
import { AlertAuditRepository } from './alert-audit.repository.js';
import { AlertRepository } from './alert.repository.js';
import { AlertRuleService } from './alert-rule.service.js';

export class AlertsService {
  constructor(
    private readonly repository = new AlertRepository(),
    private readonly auditRepository = new AlertAuditRepository(),
    private readonly ruleService = new AlertRuleService()
  ) {}

  upsert(alert: AlertRecord): AlertRecord {
    const normalized = this.ruleService.apply(alert);
    this.auditRepository.append({
      alertId: normalized.alertId,
      actorUserId: 'system',
      timestamp: new Date().toISOString(),
      action: 'created'
    });
    return this.repository.save(normalized);
  }

  list(): AlertRecord[] {
    return this.repository.list();
  }

  acknowledge(alertId: string, actorUserId: string): AlertRecord | undefined {
    const current = this.repository.get(alertId);
    if (!current) {
      return undefined;
    }
    const updated = this.repository.save({
      ...current,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    });
    this.auditRepository.append({
      alertId,
      actorUserId,
      timestamp: new Date().toISOString(),
      action: 'acknowledged'
    });
    return updated;
  }
}
