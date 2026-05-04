import type { NormalizedEvent } from '../realtime/event-normalizer.js';
import type { ElevatorTwin } from '../../contracts/elevator.js';

export type ElevatorStateEvent = NormalizedEvent<ElevatorTwin>;
