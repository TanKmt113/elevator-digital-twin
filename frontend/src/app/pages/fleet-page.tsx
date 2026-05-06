import React from 'react';
import { ElevatorFleetTable } from '../../modules/elevator/components/ElevatorFleetTable';

export function FleetPage(): React.JSX.Element {
  return (
    <section className="fleet-page min-w-0">
      <ElevatorFleetTable />
    </section>
  );
}
