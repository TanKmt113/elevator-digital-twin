import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { useRealtimeStore } from '../../../store/realtime-store';
import { summarizeElevators } from '../../../store/selectors/elevator-selectors';

export function ElevatorSummaryCards(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const duplicateEventsDropped = useRealtimeStore((state) => state.duplicateEventsDropped);
  const outOfOrderEventsRejected = useRealtimeStore((state) => state.outOfOrderEventsRejected);
  const outOfScopeEventsRejected = useRealtimeStore((state) => state.outOfScopeEventsRejected);
  const malformedEventsRejected = useRealtimeStore((state) => state.malformedEventsRejected);
  const hydrationFailures = useRealtimeStore((state) => state.hydrationFailures);
  const normalizationFailures = useRealtimeStore((state) => state.normalizationFailures);
  const commandPolicyRejections = useRealtimeStore((state) => state.commandPolicyRejections);
  const summary = summarizeElevators(elevators);
  const rejectionTotal =
    duplicateEventsDropped +
    outOfOrderEventsRejected +
    outOfScopeEventsRejected +
    malformedEventsRejected +
    hydrationFailures +
    normalizationFailures +
    commandPolicyRejections;
  const cards = [
    { label: 'Tổng số', value: summary.total, tone: 'text-slate-100' },
    { label: 'Đang hoạt động', value: summary.active, tone: 'text-emerald-300' },
    { label: 'Có lỗi', value: summary.faulted, tone: 'text-rose-300' },
    { label: 'Bị từ chối', value: rejectionTotal, tone: rejectionTotal > 0 ? 'text-amber-300' : 'text-slate-100' }
  ];

  return (
    <section className="ops-summary-grid grid gap-4 md:grid-cols-4" aria-label="elevator-summary-cards">
      {cards.map((card) => (
        <article
          key={card.label}
          className="ops-metric-card rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
        >
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {card.label}
          </p>
          <p className={`ops-metric-value mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}
