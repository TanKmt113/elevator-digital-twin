import { describe, expect, it } from 'vitest';
import { AlertRuleService } from '../../src/modules/alerts/alert-rule.service.js';

describe('alert resilience', () => {
  it('normalizes overheating alerts to critical', () => {
    const service = new AlertRuleService();
    const alert = service.apply({
      alertId: 'a1',
      elevatorId: 'E1',
      alertType: 'motor_overheating',
      severity: 'warning',
      status: 'open',
      message: 'Heat spike',
      createdAt: new Date().toISOString()
    });
    expect(alert.severity).toBe('critical');
  });
});
