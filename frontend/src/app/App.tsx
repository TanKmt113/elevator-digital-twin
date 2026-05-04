import React from 'react';
import { ElevatorList } from '../modules/elevator/components/ElevatorList';
import { ElevatorSummaryCards } from '../modules/elevator/components/ElevatorSummaryCards';

export function App(): JSX.Element {
  return (
    <main>
      <h1>Keangnam Smart Building Operations</h1>
      <ElevatorSummaryCards />
      <ElevatorList />
    </main>
  );
}
