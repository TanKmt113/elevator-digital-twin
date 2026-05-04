import React from 'react';
import { ElevatorList } from '../modules/elevator/components/ElevatorList';
import { ElevatorSummaryCards } from '../modules/elevator/components/ElevatorSummaryCards';
import { AlertPanel } from '../modules/alerts/components/AlertPanel';
import { RiskWarningPanel } from '../modules/analytics/components/RiskWarningPanel';
import { TwinScene } from '../modules/twin3d/components/TwinScene';

export function App(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
        Keangnam Smart Building Operations
      </h1>
      <ElevatorSummaryCards />
      <AlertPanel />
      <RiskWarningPanel />
      <ElevatorList />
      <TwinScene />
    </main>
  );
}
