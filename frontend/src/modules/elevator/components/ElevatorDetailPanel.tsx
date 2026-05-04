import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';

export function ElevatorDetailPanel({ elevator }: { elevator: ElevatorViewModel }): JSX.Element {
  return (
    <aside>
      <h2>{elevator.elevatorId}</h2>
      <p>Status: {elevator.status}</p>
      <p>Load: {elevator.loadPercentage ?? 'n/a'}</p>
      <p>Health: {elevator.healthState}</p>
    </aside>
  );
}
