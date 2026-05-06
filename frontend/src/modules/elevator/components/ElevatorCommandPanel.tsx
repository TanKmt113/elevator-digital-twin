import React from 'react';
import { useCommandStore } from '../../../store/command-store';
import { submitCommand } from '../services/submit-command';

type ElevatorCommand = ReturnType<typeof useCommandStore.getState>['commands'][string];

export function getLatestElevatorCommand(
  commands: Record<string, ElevatorCommand>,
  elevatorId: string
): ElevatorCommand | undefined {
  return Object.values(commands)
    .filter((command) => command.elevatorId === elevatorId)
    .sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''))[0];
}

export function ElevatorCommandPanel({ elevatorId }: { elevatorId: string }): React.JSX.Element {
  const commands = useCommandStore((state) => state.commands);
  const latestCommand = getLatestElevatorCommand(commands, elevatorId);

  return (
    <section className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Lệnh điều khiển</p>
      <button
        type="button"
        onClick={() => {
          void submitCommand({
            elevatorId,
            commandType: 'call_floor',
            parameters: { floor: 1, direction: 'up' }
          });
        }}
      >
        Mô phỏng gọi thang
      </button>
      <button
        type="button"
        onClick={() => {
          void submitCommand({ elevatorId, commandType: 'clear_fault' });
        }}
      >
        Xóa lỗi
      </button>
      {latestCommand ? (
        <p className="text-slate-300">
          Lệnh gần nhất: <span className="text-slate-100">{latestCommand.commandType}</span>{' '}
          <span className="capitalize text-slate-100">{latestCommand.status}</span>
          {latestCommand.simulated ? <span className="text-amber-100"> · mô phỏng</span> : null}
        </p>
      ) : (
        <p className="text-slate-400">Chưa có sự kiện vòng đời lệnh.</p>
      )}
    </section>
  );
}
