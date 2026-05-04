import { settings } from '../../config/settings.js';

export class SessionStalenessPolicy {
  isStale(lastEventAt: string): boolean {
    return Date.now() - new Date(lastEventAt).getTime() > settings.staleThresholdMs;
  }
}
