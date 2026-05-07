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

const severityLabels: Record<AlertViewModel['severity'], string> = {
  warning: 'Cảnh báo',
  critical: 'Nghiêm trọng'
};

const statusLabels: Record<AlertViewModel['status'], string> = {
  open: 'Đang mở',
  acknowledged: 'Đã nhận',
  resolved: 'Đã xử lý',
  suppressed: 'Tạm ẩn'
};

function formatTimestamp(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function AlertPanel(): React.JSX.Element {
  const alertRecord = useAlertStore((state) => state.alerts);
  const alerts = React.useMemo(
    () => Object.values(alertRecord).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [alertRecord]
  );
  const { severity, setSeverity } = useAlertFilters();
  const visible = filterAlerts(alerts, severity);

  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="ops-panel-head mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Hàng đợi sự cố
          </p>
          <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Cảnh báo</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="ops-count-chip rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
            {visible.length} bản ghi
          </span>
          <label className="ops-select-label flex items-center gap-2 text-sm text-slate-300">
            Mức độ
            <select
              className="ops-select rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm text-slate-100"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as 'all' | 'warning' | 'critical')}
            >
              <option value="all">Tất cả</option>
              <option value="warning">Cảnh báo</option>
              <option value="critical">Nghiêm trọng</option>
            </select>
          </label>
        </div>
      </div>
      <div className="fleet-table-wrap overflow-x-auto rounded-xl border border-white/10">
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            Không có cảnh báo phù hợp với bộ lọc hiện tại.
          </p>
        ) : null}
        {visible.length > 0 ? (
          <table className="fleet-table w-full min-w-[900px] text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th scope="col">Mã cảnh báo</th>
                <th scope="col">Mã thang</th>
                <th scope="col">Loại</th>
                <th scope="col">Mức</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Thông điệp</th>
                <th scope="col">Tạo lúc</th>
                <th scope="col">Đã nhận</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((alert) => (
                <tr key={alert.alertId}>
                  <td className="font-semibold text-slate-100">{alert.alertId}</td>
                  <td>{alert.elevatorId}</td>
                  <td className="capitalize">{alert.alertType}</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        alert.severity === 'critical'
                          ? 'bg-rose-400/10 text-rose-100'
                          : 'bg-amber-300/10 text-amber-100'
                      }`}
                    >
                      {severityLabels[alert.severity]}
                    </span>
                  </td>
                  <td>{statusLabels[alert.status]}</td>
                  <td className="max-w-[300px] text-slate-100" title={alert.message}>
                    {alert.message}
                  </td>
                  <td className="text-slate-400">{formatTimestamp(alert.createdAt)}</td>
                  <td className="text-slate-400">{formatTimestamp(alert.acknowledgedAt ?? undefined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}
