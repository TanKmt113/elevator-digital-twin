import { incrementMetric } from './metrics.js';

export function recordHistoryQuery(): void {
  incrementMetric('history_query_total');
}
