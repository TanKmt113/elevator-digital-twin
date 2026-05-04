import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { mapElevatorStateToScene } from '../services/map-elevator-state-to-scene';
import { useTwinSelection } from '../hooks/useTwinSelection';
import { ElevatorMesh } from './ElevatorMesh';
import { TwinControls } from './TwinControls';
import { TwinDetailOverlay } from './TwinDetailOverlay';

export function TwinScene(): JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const selection = useTwinSelection();
  const selectedElevator = elevators.find(
    (elevator) => elevator.elevatorId === selection.selectedElevatorId
  );

  return (
    <section>
      <TwinControls />
      {elevators.map((elevator) => (
        <ElevatorMesh
          key={elevator.elevatorId}
          asset={mapElevatorStateToScene(
            elevator,
            elevator.elevatorId === selection.selectedElevatorId
          )}
          onSelect={selection.selectElevator}
        />
      ))}
      <TwinDetailOverlay elevator={selectedElevator} />
    </section>
  );
}
