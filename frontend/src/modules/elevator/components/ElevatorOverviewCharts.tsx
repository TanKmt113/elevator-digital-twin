import React from 'react';
import { useElevatorStore, type ElevatorViewModel } from '../../../store/elevator-store';
import { useRealtimeStore } from '../../../store/realtime-store';

interface StatusCountRow {
  status: string;
  count: number;
}

interface MetricBarRow {
  key: string;
  label: string;
  value: number;
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    moving: 'Đang chạy',
    idle: 'Chờ',
    fault: 'Lỗi',
    offline: 'Ngắt',
    unknown: 'Không rõ'
  };
  return map[status] ?? status;
}

function aggregateStatusCounts(elevators: ElevatorViewModel[]): StatusCountRow[] {
  const tally = new Map<string, number>();
  for (const e of elevators) {
    const key = e.status?.trim() ? e.status : 'unknown';
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

function maxFloorAcross(elevators: ElevatorViewModel[]): number {
  let max = 1;
  for (const e of elevators) {
    max = Math.max(max, e.currentFloor, e.targetFloor ?? 0);
  }
  return max;
}

const BAR_COLORS = ['#7dd3c7', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#94a3b8'];

function HorizontalBarList({
  title,
  rows,
  'aria-label': ariaLabel
}: {
  title: string;
  rows: MetricBarRow[];
  'aria-label': string;
}): React.JSX.Element {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const allZero = rows.every((r) => r.value === 0);

  return (
    <div className="ops-chart-panel" aria-label={ariaLabel}>
      <h3 className="ops-chart-title">{title}</h3>
      {allZero ? <p className="ops-muted mb-3 text-sm">Hiện tại tất cả chỉ số đều bằng 0.</p> : null}
      <div className="ops-chart-bars space-y-3">
        {rows.map((row, i) => (
          <div key={row.key}>
            <div className="mb-1 flex justify-between gap-2 text-xs text-slate-400">
              <span>{row.label}</span>
              <span className="font-semibold text-slate-200">{row.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-2.5 rounded-full transition-[width] duration-300"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  opacity: row.value > 0 ? 0.95 : 0.25
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDistributionChart({ elevators }: { elevators: ElevatorViewModel[] }): React.JSX.Element {
  const rows = aggregateStatusCounts(elevators);
  const max = Math.max(1, ...rows.map((r) => r.count));

  if (rows.length === 0) {
    return (
      <div className="ops-chart-panel" aria-label="Biểu đồ phân bố trạng thái thang">
        <h3 className="ops-chart-title">Phân bố trạng thái</h3>
        <p className="ops-muted text-sm">Chưa có dữ liệu trạng thái.</p>
      </div>
    );
  }

  return (
    <div className="ops-chart-panel" aria-label="Biểu đồ phân bố trạng thái thang">
      <h3 className="ops-chart-title">Phân bố trạng thái</h3>
      <div className="ops-chart-bars space-y-3">
        {rows.map((row, i) => (
          <div key={row.status}>
            <div className="mb-1 flex justify-between gap-2 text-xs text-slate-400">
              <span>{translateStatus(row.status)}</span>
              <span className="font-semibold text-slate-200">{row.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-2.5 rounded-full transition-[width] duration-300"
                style={{
                  width: `${(row.count / max) * 100}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  opacity: 0.95
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloorByElevatorChart({ elevators }: { elevators: ElevatorViewModel[] }): React.JSX.Element {
  const sorted = [...elevators].sort((a, b) => a.elevatorId.localeCompare(b.elevatorId));
  const cap = maxFloorAcross(sorted);
  const barW = sorted.length > 0 ? Math.min(28, 320 / Math.max(sorted.length, 1)) : 8;
  const gap = 6;
  const chartW = Math.max(320, sorted.length * (barW + gap));
  const chartH = 120;
  const baseline = chartH - 16;

  if (sorted.length === 0) {
    return (
      <div className="ops-chart-panel" aria-label="Biểu đồ tầng hiện tại theo thang">
        <h3 className="ops-chart-title">Tầng hiện tại theo thang</h3>
        <p className="ops-muted text-sm">Chưa có thang máy trong phạm vi.</p>
      </div>
    );
  }

  return (
    <div className="ops-chart-panel" aria-label="Biểu đồ tầng hiện tại theo thang">
      <h3 className="ops-chart-title">Tầng hiện tại theo thang</h3>
      <div className="ops-chart-scroll overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="ops-chart-svg ops-chart-svg--floors min-h-[140px] w-full"
          role="img"
          aria-label="Cột thể hiện tầng hiện tại của từng thang máy"
        >
          <line x1="8" y1={baseline} x2={chartW - 8} y2={baseline} stroke="rgba(210,230,226,0.15)" strokeWidth="1" />
          {sorted.map((e, i) => {
            const x = 12 + i * (barW + gap);
            const h = cap > 0 ? (e.currentFloor / cap) * (baseline - 12) : 0;
            const y = baseline - h;
            const fill = e.status === 'fault' ? '#f87171' : e.status === 'moving' ? '#7dd3c7' : '#60a5fa';
            return (
              <g key={e.elevatorId}>
                <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx="3" fill={fill} opacity={0.9} />
                <text x={x + barW / 2} y={chartH - 2} textAnchor="middle" fill="#9db5b3" fontSize="9">
                  {e.elevatorId.length > 6 ? `${e.elevatorId.slice(0, 5)}…` : e.elevatorId}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="ops-muted mt-2 text-xs">Trục dọc: tầng (tối đa {cap} trong dữ liệu hiện tại).</p>
    </div>
  );
}

function RejectionPipelineChart(): React.JSX.Element {
  const duplicateEventsDropped = useRealtimeStore((s) => s.duplicateEventsDropped);
  const outOfOrderEventsRejected = useRealtimeStore((s) => s.outOfOrderEventsRejected);
  const outOfScopeEventsRejected = useRealtimeStore((s) => s.outOfScopeEventsRejected);
  const malformedEventsRejected = useRealtimeStore((s) => s.malformedEventsRejected);
  const hydrationFailures = useRealtimeStore((s) => s.hydrationFailures);
  const normalizationFailures = useRealtimeStore((s) => s.normalizationFailures);
  const commandPolicyRejections = useRealtimeStore((s) => s.commandPolicyRejections);

  const rows = [
    { key: 'dup', label: 'Sự kiện trùng', value: duplicateEventsDropped },
    { key: 'order', label: 'Sai thứ tự', value: outOfOrderEventsRejected },
    { key: 'scope', label: 'Ngoài phạm vi', value: outOfScopeEventsRejected },
    { key: 'malformed', label: 'Dữ liệu lỗi', value: malformedEventsRejected },
    { key: 'hydrate', label: 'Hydrate thất bại', value: hydrationFailures },
    { key: 'norm', label: 'Chuẩn hóa thất bại', value: normalizationFailures },
    { key: 'policy', label: 'Chính sách lệnh', value: commandPolicyRejections }
  ];

  return (
    <HorizontalBarList
      title="Luồng realtime - bị từ chối / lỗi"
      rows={rows}
      aria-label="Biểu đồ sự kiện bị từ chối"
    />
  );
}

export function ElevatorOverviewCharts(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((s) => s.elevators));

  return (
    <section className="ops-chart-grid" aria-label="Biểu đồ và báo cáo vận hành">
      <StatusDistributionChart elevators={elevators} />
      <FloorByElevatorChart elevators={elevators} />
      <RejectionPipelineChart />
    </section>
  );
}
