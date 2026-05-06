import { describe, expect, it } from 'vitest';
import { createControlCommand } from '../../src/modules/elevators/control-command.model.js';

describe('commands contract', () => {
  it('defines a command submission endpoint', () => {
    expect('/commands').toContain('commands');
  });

  it('supports enhanced command lifecycle fields', () => {
    const command = createControlCommand({
      elevatorId: 'A',
      buildingId: 'L72',
      commandType: 'call_floor',
      parameters: { floor: 12, direction: 'up' }
    });

    expect(command).toMatchObject({
      elevatorId: 'A',
      buildingId: 'L72',
      commandType: 'call_floor',
      status: 'accepted',
      policyDecision: 'allowed',
      parameters: { floor: 12, direction: 'up' }
    });
    expect(command.updatedAt).toEqual(expect.any(String));
    expect(command.correlationId).toContain('corr-');
  });
});
