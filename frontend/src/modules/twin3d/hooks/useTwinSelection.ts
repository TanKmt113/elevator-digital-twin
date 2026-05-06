import { useElevatorStore } from '../../../store/elevator-store';

export function useTwinSelection() {
  const selectedElevatorId = useElevatorStore((state) => state.selectedElevatorId);
  const selectElevator = useElevatorStore((state) => state.selectElevator);
  const sceneFocusMode = useElevatorStore((state) => state.sceneFocusMode);
  const setSceneFocusMode = useElevatorStore((state) => state.setSceneFocusMode);
  const cameraTransitionState = useElevatorStore((state) => state.cameraTransitionState);
  const setCameraTransitionState = useElevatorStore((state) => state.setCameraTransitionState);

  return {
    selectedElevatorId,
    sceneFocusMode,
    cameraTransitionState,
    selectElevator: (elevatorId: string | undefined) => selectElevator(elevatorId, '3d'),
    focusOverview: () => setSceneFocusMode('overview'),
    focusSelected: () => setSceneFocusMode('selected'),
    setCameraTransitionState
  };
}
