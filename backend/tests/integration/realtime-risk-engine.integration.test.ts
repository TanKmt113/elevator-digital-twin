import { describe, expect, it, vi } from 'vitest';
import { RiskAnalyticsService } from '../../src/modules/analytics/risk-analytics.service.js';
import { RiskEngineService } from '../../src/modules/analytics/risk-engine.service.js';
import { RiskPublisher } from '../../src/modules/realtime/publishers/risk.publisher.js';
import { RealtimeSessionManager } from '../../src/modules/realtime/ws-server.js';
import { doorBlockedRiskInput } from '../fixtures/risk-engine.fixtures.js';

describe('realtime risk engine integration', () => {
  it('ingests and publishes warnings produced from accepted elevator state', () => {
    const engine = new RiskEngineService();
    const analytics = new RiskAnalyticsService();
    const sessions = new RealtimeSessionManager();
    const publisher = new RiskPublisher(sessions);
    const listener = vi.fn();
    sessions.addListener(listener);

    for (const warning of engine.evaluate(doorBlockedRiskInput)) {
      publisher.publish(analytics.ingest(warning));
    }

    expect(analytics.list()).toHaveLength(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'elevator.risk.updated',
        dataClass: 'alarm',
        payload: expect.objectContaining({
          elevatorId: doorBlockedRiskInput.elevatorId,
          riskType: 'door'
        })
      })
    );
  });
});
