import React from 'react';
import { useRiskStore, type RiskDriverViewModel, type RiskLevel, type RiskWarningViewModel } from '../../../store/risk-store';

const riskLevelLabels: Record<RiskLevel, string> = {
  low: 'Thấp',
  moderate: 'Trung bình',
  high: 'Cao',
  critical: 'Tới hạn'
};

const verificationLabels: Record<NonNullable<RiskWarningViewModel['verificationStatus']>, string> = {
  verified: 'Đã xác minh',
  unverified: 'Chưa xác minh',
  failed: 'Không đạt'
};

const riskTypeLabels: Record<string, string> = {
  door: 'Cửa',
  fault: 'Lỗi',
  thermal: 'Nhiệt',
  vibration: 'Rung động',
  overload: 'Quá tải'
};

function isStructuredDriver(driver: string | RiskDriverViewModel | undefined): driver is RiskDriverViewModel {
  return Boolean(driver && typeof driver === 'object' && 'label' in driver);
}

export function deriveRiskLevelLabel(level?: RiskLevel): string {
  return level ? riskLevelLabels[level] : 'Không rõ';
}

export function deriveRiskDriverLabel(driver: string | RiskDriverViewModel | undefined): string {
  if (!driver) {
    return 'Không rõ nguyên nhân';
  }

  if (isStructuredDriver(driver)) {
    return driver.label;
  }

  const fallback: Record<string, string> = {
    usage: 'Mức sử dụng cao',
    temperature: 'Nhiệt độ cao',
    vibration: 'Rung động bất thường',
    overload: 'Quá tải',
    fault: 'Lỗi đang hoạt động',
    door: 'Sự cố cửa'
  };
  return fallback[driver] ?? driver;
}

function deriveRiskTypeLabel(type?: string): string {
  return type ? riskTypeLabels[type] ?? type : 'Không rõ';
}

function formatRiskDrivers(warning: RiskWarningViewModel): string {
  if (!warning.drivers?.length) {
    return 'Không rõ nguyên nhân';
  }

  return warning.drivers.map((driver) => deriveRiskDriverLabel(driver)).join(', ');
}

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

export function deriveRiskVerificationState(warning?: RiskWarningViewModel): {
  label: string;
  toneClass: string;
} {
  if (!warning?.modelVersion || !warning.validationRunId) {
    return {
      label: 'Chưa xác minh',
      toneClass: 'bg-amber-300/10 text-amber-100'
    };
  }

  if (warning.verificationStatus === 'failed' || warning.modelTrace?.validationStatus === 'failed') {
    return {
      label: 'Không đạt',
      toneClass: 'bg-rose-400/10 text-rose-100'
    };
  }

  return {
    label: verificationLabels[warning.verificationStatus ?? 'verified'],
    toneClass: 'bg-emerald-400/10 text-emerald-100'
  };
}

export function RiskWarningPanel(): React.JSX.Element {
  const warningRecord = useRiskStore((state) => state.warnings);
  const warnings = React.useMemo(
    () =>
      Object.values(warningRecord).sort(
        (a, b) => Date.parse(b.updatedAt ?? b.generatedAt) - Date.parse(a.updatedAt ?? a.generatedAt)
      ),
    [warningRecord]
  );

  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="ops-panel-head mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Bảo trì dự đoán
          </p>
          <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Bảng cảnh báo dự đoán</h2>
        </div>
        <span className="ops-count-chip rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {warnings.length} bản ghi
        </span>
      </div>

      <div className="fleet-table-wrap overflow-x-auto rounded-xl border border-white/10">
        {warnings.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            Hiện không có cảnh báo dự đoán nào.
          </p>
        ) : null}
        {warnings.length > 0 ? (
          <table className="fleet-table w-full min-w-[980px] text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th scope="col">Mã thang</th>
                <th scope="col">Loại</th>
                <th scope="col">Mức</th>
                <th scope="col">Nguyên nhân</th>
                <th scope="col">Khung</th>
                <th scope="col">Xác minh</th>
                <th scope="col">Luật / Trace</th>
                <th scope="col">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((warning) => {
                const verification = deriveRiskVerificationState(warning);
                const trace = warning.modelTrace?.ruleIds?.join(', ');
                return (
                  <tr key={warning.riskWarningId}>
                    <td className="font-semibold text-slate-100">{warning.elevatorId}</td>
                    <td>{deriveRiskTypeLabel(warning.riskType)}</td>
                    <td>
                      <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                        {deriveRiskLevelLabel(warning.riskLevel)}
                      </span>
                    </td>
                    <td className="max-w-[260px] text-slate-100" title={formatRiskDrivers(warning)}>
                      {formatRiskDrivers(warning)}
                    </td>
                    <td>{warning.predictedWindowHours} giờ</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${verification.toneClass}`}>
                        {verification.label}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate text-slate-300" title={trace ?? warning.modelVersion}>
                      {warning.modelVersion ?? '—'}
                      {trace ? ` / ${trace}` : ''}
                    </td>
                    <td className="text-slate-400">{formatTimestamp(warning.updatedAt ?? warning.generatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}
