import { useElevatorStore } from '../../../store/elevator-store';

export function useTwinSelection() {
  const selectedElevatorId = useElevatorStore((state) => state.selectedElevatorId);
  const selectElevator = useElevatorStore((state) => state.selectElevator);

  return {
    selectedElevatorId,
    selectElevator: (elevatorId: string | undefined) => selectElevator(elevatorId, '3d')
  };
}
