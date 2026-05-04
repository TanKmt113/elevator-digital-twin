import React from 'react';
import { useAlertStore } from '../../../store/alert-store';
import type { AlertViewModel } from '../../../store/alert-store';
import { useAlertFilters } from '../hooks/useAlertFilters';

export function filterAlerts(
  alerts: AlertViewModel[],
  severity: 'all' | 'warning' | 'critical'
): AlertViewModel[] {
  return severity === 'all' ? alerts : alerts.filter((alert) => alert.severity === severity);
}

export function AlertPanel(): React.JSX.Element {
  const alerts = Object.values(useAlertStore((state) => state.alerts));
  const { severity, setSeverity } = useAlertFilters();
  const visible = filterAlerts(alerts, severity);

  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="ops-panel-head mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Incident Queue
          </p>
          <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Alerts</h2>
        </div>
        <label className="ops-select-label flex items-center gap-2 text-sm text-slate-300">
          Severity
          <select
            className="ops-select rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm text-slate-100"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as 'all' | 'warning' | 'critical')}
          >
          <option value="all">All</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        </label>
      </div>
      <div className="ops-list grid gap-3">
        {visible.length === 0 ? (
          <article className="ops-empty rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            No alerts match the current filter.
          </article>
        ) : null}
        {visible.map((alert) => (
          <article
            key={alert.alertId}
            className="ops-list-item rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-base font-semibold capitalize text-slate-100">{alert.alertType}</strong>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                alert.severity === 'critical'
                  ? 'bg-rose-400/10 text-rose-100'
                  : 'bg-amber-300/10 text-amber-100'
              }`}>
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{alert.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
