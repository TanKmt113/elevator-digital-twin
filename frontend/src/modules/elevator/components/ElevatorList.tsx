import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { ElevatorStatusBadge } from './ElevatorStatusBadge';

export function ElevatorList(): JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));

  return (
    <section>
      {elevators.map((elevator) => (
        <article key={elevator.elevatorId}>
          <strong>{elevator.elevatorId}</strong>
          <p>Floor: {elevator.currentFloor}</p>
          <p>Direction: {elevator.direction}</p>
          <p>Door: {elevator.doorState}</p>
          <ElevatorStatusBadge status={elevator.status} stale={elevator.stale} />
        </article>
      ))}
    </section>
  );
}
