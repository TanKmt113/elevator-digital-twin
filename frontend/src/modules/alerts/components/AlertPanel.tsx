import React from 'react';
import { useAlertStore } from '../../../store/alert-store';
import { useAlertFilters } from '../hooks/useAlertFilters';

export function AlertPanel(): JSX.Element {
  const alerts = Object.values(useAlertStore((state) => state.alerts));
  const { severity, setSeverity } = useAlertFilters();
  const visible = severity === 'all' ? alerts : alerts.filter((alert) => alert.severity === severity);

  return (
    <section>
      <label>
        Severity
        <select value={severity} onChange={(event) => setSeverity(event.target.value as 'all' | 'warning' | 'critical')}>
          <option value="all">All</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      {visible.map((alert) => (
        <article key={alert.alertId}>
          <strong>{alert.alertType}</strong>
          <p>{alert.message}</p>
        </article>
      ))}
    </section>
  );
}
