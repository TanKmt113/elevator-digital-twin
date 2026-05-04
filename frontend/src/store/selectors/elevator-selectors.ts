import type { ElevatorViewModel } from '../elevator-store';

export function summarizeElevators(elevators: ElevatorViewModel[]) {
  return {
    total: elevators.length,
    active: elevators.filter((elevator) => elevator.status !== 'fault' && elevator.status !== 'offline').length,
    faulted: elevators.filter((elevator) => elevator.status === 'fault').length
  };
}
