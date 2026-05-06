import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { ElevatorDetailDrawer } from './ElevatorDetailDrawer';
import { ElevatorStatusBadge } from './ElevatorStatusBadge';
import { translateDirection, translateDoorState, translateHealthState } from './elevator-labels';

function formatCell(value: unknown, fallback = '—'): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
}

export function ElevatorFleetTable(): React.JSX.Element {
  const elevatorRecord = useElevatorStore((s) => s.elevators);
  const selectedElevatorId = useElevatorStore((s) => s.selectedElevatorId);
  const selectElevator = useElevatorStore((s) => s.selectElevator);
  const elevators = React.useMemo(() => Object.values(elevatorRecord), [elevatorRecord]);
  const sorted = React.useMemo(
    () => [...elevators].sort((a, b) => a.elevatorId.localeCompare(b.elevatorId)),
    [elevators]
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const selectedElevator = selectedElevatorId ? elevatorRecord[selectedElevatorId] : undefined;

  React.useEffect(() => {
    if (drawerOpen && !selectedElevator) {
      setDrawerOpen(false);
    }
  }, [drawerOpen, selectedElevator]);

  const activateRow = (elevatorId: string, buildingId?: string): void => {
    selectElevator(elevatorId, 'list', buildingId);
    setDrawerOpen(true);
  };

  const onRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    elevatorId: string,
    buildingId?: string
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateRow(elevatorId, buildingId);
    }
  };

  return (
    <>
      <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="ops-panel-head mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Đội thang
            </p>
            <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Bảng theo dõi thang máy</h2>
          </div>
          <span className="ops-count-chip rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
            {sorted.length} đang theo dõi
          </span>
        </div>

        <div className="fleet-table-wrap overflow-x-auto rounded-xl border border-white/10">
          {sorted.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Chưa tải được trạng thái thang máy cho phạm vi hiện tại.
            </p>
          ) : (
            <table className="fleet-table w-full min-w-[720px] text-left text-sm text-slate-200">
              <thead>
                <tr>
                  <th scope="col">Mã thang</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Tầng</th>
                  <th scope="col">Đích</th>
                  <th scope="col">Hướng</th>
                  <th scope="col">Cửa</th>
                  <th scope="col">Tải %</th>
                  <th scope="col">Sức khỏe</th>
                  <th scope="col">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const isSelected = selectedElevatorId === row.elevatorId;
                  return (
                    <tr
                      key={row.elevatorId}
                      tabIndex={0}
                      aria-selected={isSelected}
                      data-selected={isSelected ? 'true' : undefined}
                      className={`fleet-table-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => activateRow(row.elevatorId, row.buildingId)}
                      onKeyDown={(e) => onRowKeyDown(e, row.elevatorId, row.buildingId)}
                    >
                      <td className="font-semibold text-slate-100">{row.elevatorId}</td>
                      <td>
                        <ElevatorStatusBadge status={row.status} stale={row.stale} />
                      </td>
                      <td>{row.currentFloor}</td>
                      <td>{formatCell(row.targetFloor)}</td>
                      <td>{translateDirection(row.direction)}</td>
                      <td>{translateDoorState(row.doorState)}</td>
                      <td>{formatCell(row.loadPercentage, 'n/a')}</td>
                      <td>{translateHealthState(row.healthState)}</td>
                      <td className="max-w-[140px] truncate text-slate-400" title={row.lastEventAt}>
                        {formatCell(row.lastEventAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">Nhấn vào một dòng để xem chi tiết trong bảng kéo.</p>
      </section>

      <ElevatorDetailDrawer open={drawerOpen} elevator={selectedElevator} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
