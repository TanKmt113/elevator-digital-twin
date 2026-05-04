import { settings } from '../../config/settings.js';
import type { RealtimeConnectionState } from '../../contracts/elevator.js';

export class SessionStalenessPolicy {
  isStale(lastEventAt: string): boolean {
    return Date.now() - new Date(lastEventAt).getTime() > settings.staleThresholdMs;
  }

  connectionStateFor(lastEventAt?: string, hasFailure = false): RealtimeConnectionState {
    if (hasFailure) {
      return 'degraded';
    }

    if (!lastEventAt) {
      return 'connecting';
    }

    return this.isStale(lastEventAt) ? 'stale' : 'live';
  }
}
