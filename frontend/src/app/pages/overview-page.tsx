import React from 'react';
import { ElevatorOverviewCharts } from '../../modules/elevator/components/ElevatorOverviewCharts';
import { ElevatorSummaryCards } from '../../modules/elevator/components/ElevatorSummaryCards';

export function OverviewPage(): React.JSX.Element {
  return (
    <>
      <ElevatorSummaryCards />
      <ElevatorOverviewCharts />
    </>
  );
}
