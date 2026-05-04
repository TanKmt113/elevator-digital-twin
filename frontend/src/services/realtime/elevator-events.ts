import type { ElevatorViewModel } from '../../store/elevator-store';
import { useElevatorStore } from '../../store/elevator-store';
import { useRealtimeStore } from '../../store/realtime-store';

interface ElevatorStateEnvelope {
  eventType: string;
  payload: ElevatorViewModel;
}

export function handleRealtimeEvent(event: ElevatorStateEnvelope): void {
  if (event.eventType === 'elevator.state.changed') {
    useElevatorStore.getState().upsertElevator(event.payload);
    useRealtimeStore.getState().setConnected(true);
    useRealtimeStore.getState().setDataState('ready');
  }
}
