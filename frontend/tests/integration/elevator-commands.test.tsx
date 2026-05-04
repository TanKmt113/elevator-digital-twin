import { describe, expect, it } from 'vitest';
import { submitCommand } from '../../src/modules/elevator/services/submit-command';

describe('elevator commands', () => {
  it('stores an accepted command on submit', async () => {
    const command = await submitCommand({ elevatorId: 'A', commandType: 'stop' });
    expect(command.status).toBe('accepted');
  });
});
