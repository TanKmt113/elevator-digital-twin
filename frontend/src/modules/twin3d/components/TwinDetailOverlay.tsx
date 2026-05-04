import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';

export function TwinDetailOverlay({ elevator }: { elevator?: ElevatorViewModel }): React.JSX.Element | null {
  if (!elevator) {
    return null;
  }

  return (
    <aside>
      <h3>{elevator.elevatorId}</h3>
      <p>Floor: {elevator.currentFloor}</p>
      <p>Status: {elevator.status}</p>
    </aside>
  );
}
