import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import { ElevatorCommandPanel } from './ElevatorCommandPanel';
import { ElevatorHistoryPanel } from './ElevatorHistoryPanel';

export function ElevatorDetailPanel({ elevator }: { elevator: ElevatorViewModel }): React.JSX.Element {
  return (
    <aside>
      <h2>{elevator.elevatorId}</h2>
      <p>Status: {elevator.status}</p>
      <p>Load: {elevator.loadPercentage ?? 'n/a'}</p>
      <p>Health: {elevator.healthState}</p>
      <ElevatorCommandPanel elevatorId={elevator.elevatorId} />
      <ElevatorHistoryPanel elevatorId={elevator.elevatorId} />
    </aside>
  );
}
