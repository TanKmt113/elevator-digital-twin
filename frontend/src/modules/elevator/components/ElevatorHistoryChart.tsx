import React from 'react';
import type { HistoryPoint } from '../../../store/history-store';

export function ElevatorHistoryChart({ points }: { points: HistoryPoint[] }): React.JSX.Element {
  return (
    <section>
      {points.map((point) => (
        <p key={point.recordedAt}>
          {point.recordedAt}: floor {point.currentFloor ?? 'n/a'}
        </p>
      ))}
    </section>
  );
}
