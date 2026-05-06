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
  const warnings = Object.values(useRiskStore((state) => state.warnings));
  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Bảo trì dự đoán
      </p>
      <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Cảnh báo dự đoán</h2>
      <div className="ops-list mt-4 grid gap-3">
        {warnings.length === 0 ? (
          <article className="ops-empty rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            Hiện không có cảnh báo dự đoán nào.
          </article>
        ) : null}
        {warnings.map((warning) => (
          (() => {
            const verification = deriveRiskVerificationState(warning);
            return (
          <article
            key={warning.riskWarningId}
            className="ops-list-item rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-base font-semibold text-slate-100">{warning.elevatorId}</strong>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                {deriveRiskLevelLabel(warning.riskLevel)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Khung rủi ro: {warning.predictedWindowHours} giờ</p>
            {warning.drivers?.length ? (
              <ul className="mt-3 grid gap-2 text-sm text-slate-200">
                {warning.drivers.map((driver, index) => (
                  <li key={isStructuredDriver(driver) ? driver.driverId : `${driver}-${index}`}>
                    {deriveRiskDriverLabel(driver)}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className={`rounded-full px-2.5 py-1 font-semibold ${verification.toneClass}`}>
                {verification.label}
              </span>
              {warning.modelVersion ? <span>Luật {warning.modelVersion}</span> : null}
              {warning.validationRunId ? <span>Lượt kiểm tra {warning.validationRunId}</span> : null}
              {warning.modelTrace?.ruleIds?.length ? <span>Trace {warning.modelTrace.ruleIds.join(', ')}</span> : null}
            </div>
          </article>
            );
          })()
        ))}
      </div>
    </section>
  );
}
