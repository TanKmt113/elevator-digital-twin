import { describe, expect, it } from 'vitest';
import { AlertsService } from '../../src/modules/alerts/alerts.service.js';

describe('alerts workflow', () => {
  it('acknowledges a raised alert', () => {
    const service = new AlertsService();
    service.upsert({
      alertId: 'a1',
      elevatorId: 'E1',
      alertType: 'overload',
      severity: 'critical',
      status: 'open',
      message: 'Overload detected',
      createdAt: new Date().toISOString()
    });
    const updated = service.acknowledge('a1', 'user-1');
    expect(updated?.status).toBe('acknowledged');
  });
});
