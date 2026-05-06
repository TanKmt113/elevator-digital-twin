import React from 'react';
import type { HistoryPoint } from '../../../store/history-store';

export function ElevatorHistoryChart({ points }: { points: HistoryPoint[] }): React.JSX.Element {
  return (
    <section>
      {points.map((point) => (
        <p key={point.recordedAt ?? point.capturedAt}>
          {point.recordedAt ?? point.capturedAt}: floor {point.currentFloor ?? 'n/a'}
          {point.doorOpenPercent !== undefined ? ` · door ${point.doorOpenPercent}%` : ''}
          {point.loadPercentage !== undefined ? ` · load ${point.loadPercentage}%` : ''}
          {point.partial ? ' · partial' : ''}
        </p>
      ))}
    </section>
  );
}
