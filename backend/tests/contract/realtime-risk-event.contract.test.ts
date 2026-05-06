import { describe, expect, it, vi } from 'vitest';
import { RiskPublisher } from '../../src/modules/realtime/publishers/risk.publisher.js';
import { RealtimeSessionManager } from '../../src/modules/realtime/ws-server.js';

describe('realtime risk event contract', () => {
  it('publishes alarm-class risk events with structured drivers', () => {
    const sessions = new RealtimeSessionManager();
    const listener = vi.fn();
    sessions.addListener(listener);

    new RiskPublisher(sessions).publish({
      riskWarningId: 'risk-org.example:L72-ELEV-A-door',
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      riskType: 'door',
      riskLevel: 'critical',
      predictedWindowHours: 12,
      generatedAt: '2026-05-06T10:00:00.000Z',
      drivers: [
        {
          driverId: 'door.blocked',
          label: 'Phát hiện kẹt cửa',
          signal: 'doorState',
          observedValue: 'blocked',
          threshold: 'blocked',
          severityContribution: 'critical'
        }
      ],
      modelVersion: 'risk-rules-v1',
      validationRunId: 'risk-engine-v1',
      verificationStatus: 'verified',
      modelTrace: {
        featureSet: 'risk-rule-engine-v1',
        scoredAt: '2026-05-06T10:00:00.000Z',
        validationStatus: 'passed'
      }
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'elevator.risk.updated',
        dataClass: 'alarm',
        payload: expect.objectContaining({
          drivers: [
            expect.objectContaining({
              driverId: 'door.blocked',
              label: 'Phát hiện kẹt cửa'
            })
          ]
        })
      })
    );
  });
});
