import React from 'react';
import { submitCommand } from '../services/submit-command';

export function ElevatorCommandPanel({ elevatorId }: { elevatorId: string }): JSX.Element {
  return (
    <section>
      <button
        type="button"
        onClick={() => {
          void submitCommand({ elevatorId, commandType: 'stop' });
        }}
      >
        Stop
      </button>
      <button
        type="button"
        onClick={() => {
          void submitCommand({ elevatorId, commandType: 'reset' });
        }}
      >
        Reset
      </button>
    </section>
  );
}
