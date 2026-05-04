import { describe, expect, it } from 'vitest';
import { CommandExecutionService } from '../../src/modules/elevators/command-execution.service.js';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';

describe('command failures', () => {
  it('rejects a move command when elevator is in fault state', () => {
    const monitoring = new ElevatorMonitoringService();
    monitoring.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72', status: 'fault' }));
    const service = new CommandExecutionService(monitoring);
    const result = service.submit(
      { elevatorId: 'A', commandType: 'move_to_floor', requestedFloor: 10 },
      { userId: 'u1', role: 'operator', buildingId: 'L72' }
    );
    expect(result.status).toBe('rejected');
  });
});
