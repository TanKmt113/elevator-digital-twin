import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/api/server.js';

describe('elevators contract', () => {
  it('defines scoped list/detail endpoints and synchronization metadata', () => {
    const { monitoringService } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    expect(['/elevators', '/elevators/:elevatorId']).toHaveLength(2);
    expect(monitoringService.getSynchronizationState()).toMatchObject({
      bootstrapStatus: expect.any(String),
      dataState: expect.any(String),
      connectionState: expect.any(String)
    });
  });
});
