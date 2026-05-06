import { incrementMetric } from './metrics.js';

export function recordElevatorStatePublished(): void {
  incrementMetric('elevator_state_published_total');
}

export function recordTwinBootstrapStarted(): void {
  incrementMetric('twin_bootstrap_started_total');
}

export function recordTwinBootstrapCompleted(): void {
  incrementMetric('twin_bootstrap_completed_total');
}

export function recordTwinBootstrapFailed(): void {
  incrementMetric('twin_bootstrap_failed_total');
}

export function recordSynchronizationDegraded(): void {
  incrementMetric('twin_synchronization_degraded_total');
}

export function recordOutOfScopeEventRejected(): void {
  incrementMetric('twin_out_of_scope_events_rejected_total');
}

export function recordMalformedEventRejected(): void {
  incrementMetric('twin_malformed_events_rejected_total');
}

export function recordOutOfOrderEventRejected(): void {
  incrementMetric('twin_out_of_order_events_rejected_total');
}

export function recordDuplicateEventDropped(): void {
  incrementMetric('twin_duplicate_events_dropped_total');
}
