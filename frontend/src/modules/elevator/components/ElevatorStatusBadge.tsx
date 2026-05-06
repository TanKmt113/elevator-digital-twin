import React from 'react';
import { translateElevatorStatus } from './elevator-labels';

export function ElevatorStatusBadge({ status, stale }: { status: string; stale: boolean }): React.JSX.Element {
  const tone = stale
    ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
    : status === 'fault' || status === 'offline'
      ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
      : status === 'moving'
        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
        : 'border-white/10 bg-white/5 text-slate-100';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${tone}`}>
      {stale ? `DỮ LIỆU CŨ - ${translateElevatorStatus(status)}` : translateElevatorStatus(status)}
    </span>
  );
}
