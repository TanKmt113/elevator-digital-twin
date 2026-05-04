import React from 'react';
import { useRiskStore } from '../../../store/risk-store';

export function RiskWarningPanel(): React.JSX.Element {
  const warnings = Object.values(useRiskStore((state) => state.warnings));
  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Predictive Maintenance
      </p>
      <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Predictive Warnings</h2>
      <div className="ops-list mt-4 grid gap-3">
        {warnings.length === 0 ? (
          <article className="ops-empty rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            No predictive warnings are active.
          </article>
        ) : null}
        {warnings.map((warning) => (
          <article
            key={warning.riskWarningId}
            className="ops-list-item rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-base font-semibold text-slate-100">{warning.elevatorId}</strong>
              <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                {warning.riskLevel}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Risk window: {warning.predictedWindowHours}h</p>
          </article>
        ))}
      </div>
    </section>
  );
}
