import { describe, expect, it } from 'vitest';
import { filterAlerts } from '../../src/modules/alerts/components/AlertPanel';
import { useAlertStore } from '../../src/store/alert-store';

describe('alert panel state', () => {
  it('stores alerts for rendering', () => {
    useAlertStore.getState().upsertAlert({
      alertId: 'a1',
      elevatorId: 'E1',
      alertType: 'overload',
      severity: 'critical',
      status: 'open',
      message: 'Overload detected',
      createdAt: new Date().toISOString()
    });
    expect(useAlertStore.getState().alerts.a1?.severity).toBe('critical');
    expect(filterAlerts(Object.values(useAlertStore.getState().alerts), 'all')[0]?.message).toBe('Overload detected');
  });
});
