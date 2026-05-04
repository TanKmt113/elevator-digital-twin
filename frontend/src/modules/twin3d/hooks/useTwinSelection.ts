import { useState } from 'react';

export function useTwinSelection() {
  const [selectedElevatorId, setSelectedElevatorId] = useState<string | undefined>();
  const [hoveredElevatorId, setHoveredElevatorId] = useState<string | undefined>();

  return {
    selectedElevatorId,
    hoveredElevatorId,
    selectElevator: setSelectedElevatorId,
    hoverElevator: setHoveredElevatorId
  };
}
