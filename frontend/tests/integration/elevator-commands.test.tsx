import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ElevatorCommandPanel, getLatestElevatorCommand } from '../../src/modules/elevator/components/ElevatorCommandPanel';
import { submitCommand } from '../../src/modules/elevator/services/submit-command';
import { useCommandStore } from '../../src/store/command-store';

describe('elevator commands', () => {
  it('stores an accepted command on submit', async () => {
    const command = await submitCommand({ elevatorId: 'A', commandType: 'call_floor' });
    expect(command.status).toBe('accepted');
  });

  it('renders lifecycle status and simulated command labels', async () => {
    useCommandStore.setState({ commands: {} });
    const command = await submitCommand({ elevatorId: 'A', commandType: 'clear_fault' });
    useCommandStore.setState({ commands: { [command.commandId]: command } });

    expect(getLatestElevatorCommand(useCommandStore.getState().commands, 'A')).toMatchObject({
      commandType: 'clear_fault',
      simulated: true
    });
    expect(renderToStaticMarkup(<ElevatorCommandPanel elevatorId="B" />)).toContain('Chưa có sự kiện vòng đời lệnh.');
  });
});
