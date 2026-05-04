import type { ElevatorViewModel } from '../../../store/elevator-store';

export interface TwinSceneAsset {
  elevatorId: string;
  y: number;
  color: 'green' | 'red' | 'yellow';
  highlighted: boolean;
}

export function mapElevatorStateToScene(
  elevator: ElevatorViewModel,
  highlighted = false
): TwinSceneAsset {
  return {
    elevatorId: elevator.elevatorId,
    y: elevator.currentFloor * 3,
    color: elevator.status === 'fault' ? 'red' : elevator.stale ? 'yellow' : 'green',
    highlighted
  };
}
