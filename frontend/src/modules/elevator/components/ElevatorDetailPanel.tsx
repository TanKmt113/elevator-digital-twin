import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import { ElevatorCommandPanel } from './ElevatorCommandPanel';
import { ElevatorHistoryPanel } from './ElevatorHistoryPanel';
import {
  translateDirection,
  translateDoorState,
  translateElevatorStatus,
  translateHealthState
} from './elevator-labels';

function formatValue(value: unknown, unit = ''): string {
  if (value === undefined || value === null || value === '') {
    return 'Không xác định';
  }

  return `${String(value)}${unit}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-100">{value}</span>
    </p>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <section className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">{title}</h3>
      <div className="grid gap-1.5 text-slate-300">{children}</div>
    </section>
  );
}

interface ElevatorDetailPanelProps {
  elevator: ElevatorViewModel;
  /** Dùng `div` khi nhúng trong Drawer để tránh lồng landmark `aside`. */
  rootElement?: 'aside' | 'div';
  className?: string;
}

export function ElevatorDetailPanel({
  elevator,
  rootElement = 'aside',
  className
}: ElevatorDetailPanelProps): React.JSX.Element {
  const missingEnhancedFields = [
    ['vị trí', elevator.positionMeters],
    ['độ mở cửa', elevator.doorOpenPercent],
    ['mức tải', elevator.loadPercentage],
    ['trạng thái phanh', elevator.brakeState],
    ['trạng thái động cơ', elevator.motorState],
    ['trạng thái bộ điều khiển', elevator.controllerState]
  ]
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([label]) => label);

  const rootClassName = [
    'ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const Root = rootElement;

  return (
    <Root className={rootClassName}>
      <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Tài sản đã chọn
      </p>
      <h2 className="ops-panel-title mt-1 text-2xl font-semibold text-slate-100">{elevator.elevatorId}</h2>
      <div className="mt-3 grid gap-2 text-sm">
        {elevator.stale ? (
          <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-50">
            Dữ liệu trực tiếp đã cũ; đang hiển thị trạng thái cuối cùng được backend chấp nhận.
          </p>
        ) : null}
        {missingEnhancedFields.length > 0 ? (
          <p className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sky-50">
            Dữ liệu Twin chưa đầy đủ: thiếu {missingEnhancedFields.join(', ')}.
          </p>
        ) : null}
      </div>
      <div className="ops-detail-grid mt-4 grid gap-3">
        <DetailSection title="Trạng thái">
          <DetailRow label="Tình trạng" value={translateElevatorStatus(elevator.status)} />
          <DetailRow label="Tầng" value={`${elevator.currentFloor} -> ${formatValue(elevator.targetFloor)}`} />
          <DetailRow label="Vị trí" value={formatValue(elevator.positionMeters, ' m')} />
          <DetailRow label="Tiến độ tầng" value={formatValue(elevator.floorProgress)} />
          <DetailRow label="Tốc độ" value={formatValue(elevator.speedMps, ' m/s')} />
          <DetailRow label="Hướng" value={translateDirection(elevator.direction)} />
          <DetailRow label="Chế độ" value={<span className="capitalize">{formatValue(elevator.mode)}</span>} />
          <DetailRow label="Sự kiện cuối" value={formatValue(elevator.lastEventAt)} />
        </DetailSection>
        <DetailSection title="Cửa & tải">
          <DetailRow label="Cửa" value={translateDoorState(elevator.doorState)} />
          <DetailRow label="Độ mở cửa" value={formatValue(elevator.doorOpenPercent, '%')} />
          <DetailRow label="Vật cản cửa" value={formatValue(elevator.doorObstruction)} />
          <DetailRow label="Chu kỳ cửa" value={formatValue(elevator.doorCycleCount)} />
          <DetailRow label="Tải" value={formatValue(elevator.loadPercentage, '%')} />
          <DetailRow label="Tải kg" value={formatValue(elevator.loadKg, ' kg')} />
          <DetailRow label="Tải định mức" value={formatValue(elevator.ratedLoadKg, ' kg')} />
          <DetailRow label="Ước tính người" value={formatValue(elevator.occupancyEstimate)} />
        </DetailSection>
        <DetailSection title="Máy kéo">
          <DetailRow label="Chế độ dịch vụ" value={formatValue(elevator.serviceMode)} />
          <DetailRow label="Phanh" value={<span className="capitalize">{formatValue(elevator.brakeState)}</span>} />
          <DetailRow label="Động cơ" value={<span className="capitalize">{formatValue(elevator.motorState)}</span>} />
          <DetailRow label="Bộ điều khiển" value={<span className="capitalize">{formatValue(elevator.controllerState)}</span>} />
          <DetailRow label="Nhiệt động cơ" value={formatValue(elevator.motorTempC, ' C')} />
          <DetailRow label="Nhiệt bộ điều khiển" value={formatValue(elevator.controllerTempC, ' C')} />
          <DetailRow label="Công suất" value={formatValue(elevator.powerKw, ' kW')} />
          <DetailRow label="Rung động" value={formatValue(elevator.vibrationLevel)} />
        </DetailSection>
        <DetailSection title="Lỗi & cuộc gọi">
          <DetailRow label="Sức khỏe" value={translateHealthState(elevator.healthState)} />
          <DetailRow label="Mã lỗi" value={formatValue(elevator.faultCode)} />
          <DetailRow label="Mức độ" value={<span className="capitalize">{formatValue(elevator.faultSeverity)}</span>} />
          <DetailRow label="Lỗi gần nhất" value={formatValue(elevator.lastFaultAt)} />
          <DetailRow
            label="Cuộc gọi đang chờ"
            value={
              elevator.activeCalls?.length
                ? elevator.activeCalls.map((call) => `${call.floor} ${translateDirection(call.direction)}`).join(', ')
                : 'không có'
            }
          />
          <DetailRow label="Hàng đợi dừng" value={elevator.stopQueue?.length ? elevator.stopQueue.join(', ') : 'không có'} />
          <DetailRow label="ETA" value={formatValue(elevator.etaSeconds, ' s')} />
        </DetailSection>
      </div>
      <div className="ops-control-stack mt-4 grid gap-4">
        <ElevatorCommandPanel elevatorId={elevator.elevatorId} />
        <ElevatorHistoryPanel elevatorId={elevator.elevatorId} />
      </div>
    </Root>
  );
}
