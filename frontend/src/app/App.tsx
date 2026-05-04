import React from 'react';
import { ElevatorList } from '../modules/elevator/components/ElevatorList';
import { ElevatorSummaryCards } from '../modules/elevator/components/ElevatorSummaryCards';
import { AlertPanel } from '../modules/alerts/components/AlertPanel';
import { RiskWarningPanel } from '../modules/analytics/components/RiskWarningPanel';
import { TwinScene } from '../modules/twin3d/components/TwinScene';

export function App(): JSX.Element {
  return (
    <main>
      <h1>Keangnam Smart Building Operations</h1>
      <ElevatorSummaryCards />
      <AlertPanel />
      <RiskWarningPanel />
      <ElevatorList />
      <TwinScene />
    </main>
  );
}
