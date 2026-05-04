import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { summarizeElevators } from '../../../store/selectors/elevator-selectors';

export function ElevatorSummaryCards(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const summary = summarizeElevators(elevators);
  return (
    <section>
      <p>Total: {summary.total}</p>
      <p>Active: {summary.active}</p>
      <p>Faulted: {summary.faulted}</p>
    </section>
  );
}
