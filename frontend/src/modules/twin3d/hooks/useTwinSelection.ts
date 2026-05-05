import { useElevatorStore } from '../../../store/elevator-store';

export function useTwinSelection() {
  const selectedElevatorId = useElevatorStore((state) => state.selectedElevatorId);
  const selectElevator = useElevatorStore((state) => state.selectElevator);
  const sceneFocusMode = useElevatorStore((state) => state.sceneFocusMode);
  const setSceneFocusMode = useElevatorStore((state) => state.setSceneFocusMode);

  return {
    selectedElevatorId,
    sceneFocusMode,
    selectElevator: (elevatorId: string | undefined) => selectElevator(elevatorId, '3d'),
    focusOverview: () => setSceneFocusMode('overview'),
    focusSelected: () => setSceneFocusMode('selected')
  };
}
