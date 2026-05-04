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
      { userId: 'u1', role: 'operator', buildingId: 'L72' }
    );
    expect(result.status).toBe('accepted');
  });
});
