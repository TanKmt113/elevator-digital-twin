import React from 'react';
import { useHistoryStore } from '../../../store/history-store';
import { fetchElevatorHistory } from '../services/fetch-elevator-history';
import { ElevatorHistoryChart } from './ElevatorHistoryChart';

export function ElevatorHistoryPanel({ elevatorId }: { elevatorId: string }): React.JSX.Element {
  const points = useHistoryStore((state) => state.historyByElevator[elevatorId] ?? []);

  return (
    <section>
      <button
        type="button"
        onClick={() => {
          void fetchElevatorHistory(elevatorId);
        }}
      >
        Load History
      </button>
      <ElevatorHistoryChart points={points} />
    </section>
  );
}
