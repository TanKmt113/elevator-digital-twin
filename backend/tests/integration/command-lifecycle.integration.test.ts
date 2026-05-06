import { describe, expect, it } from 'vitest';
import { CommandExecutionService } from '../../src/modules/elevators/command-execution.service.js';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';

describe('command lifecycle', () => {
  it('accepts a command for a healthy elevator', () => {
    const monitoring = new ElevatorMonitoringService();
    monitoring.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72', status: 'idle' }));
    const service = new CommandExecutionService(monitoring);
    const result = service.submit(
      { elevatorId: 'A', commandType: 'stop' },
      {
        userId: 'u1',
        role: 'operator',
        buildingId: 'L72',
        buildingIds: ['L72'],
        isPlatformAdmin: false
      }
    );
    expect(result.status).toBe('accepted');
  });

  it('rejects stale or unsafe commands without mutating accepted twin state', () => {
    const monitoring = new ElevatorMonitoringService();
    monitoring.upsert(createElevatorTwin({
      elevatorId: 'A',
      buildingId: 'L72',
      status: 'fault',
      currentFloor: 7,
      stale: false
    }));
    const service = new CommandExecutionService(monitoring);
    const result = service.submit(
      { elevatorId: 'A', buildingId: 'L72', commandType: 'call_floor', parameters: { floor: 9 } },
      {
        userId: 'u1',
        role: 'operator',
        buildingId: 'L72',
        buildingIds: ['L72'],
        isPlatformAdmin: false
      }
    );

    expect(result).toMatchObject({
      status: 'rejected',
      policyDecision: 'rejected'
    });
    expect(monitoring.get('A')).toMatchObject({
      status: 'fault',
      currentFloor: 7
    });
    expect(service.audits()[0]).toMatchObject({
      outcome: 'rejected',
      correlationId: result.correlationId
    });
  });
});
