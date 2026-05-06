import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import type { TwinSceneRuntimeState } from '../../../store/realtime-store';
import type { TwinSceneFocusMode } from '../../../store/elevator-store';
import type { TwinRenderSample } from '../services/twin3d-performance';

export function TwinDetailOverlay({
  elevator,
  sceneRuntime = 'loading',
  focusMode = 'overview',
  projectionCount = 0,
  performanceSample,
  webglMessage,
  projectionFailures = 0,
  activeSessions = 0,
  duplicateEventsDropped = 0,
  outOfOrderEventsRejected = 0,
  outOfScopeEventsRejected = 0,
  malformedEventsRejected = 0,
  staleMessage
}: {
  elevator?: ElevatorViewModel;
  sceneRuntime?: TwinSceneRuntimeState;
  focusMode?: TwinSceneFocusMode;
  projectionCount?: number;
  performanceSample?: TwinRenderSample;
  webglMessage?: string;
  projectionFailures?: number;
  activeSessions?: number;
  duplicateEventsDropped?: number;
  outOfOrderEventsRejected?: number;
  outOfScopeEventsRejected?: number;
  malformedEventsRejected?: number;
  staleMessage?: string;
}): React.JSX.Element {
  const runtimeCopy = getRuntimeCopy(sceneRuntime);

  return (
    <aside className="ops-twin-overlay rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-300 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ops-label">Trạng thái cảnh</p>
          <h3 className="ops-item-title text-base font-semibold text-slate-100">{runtimeCopy.title}</h3>
        </div>
        <span className="ops-count-chip">{projectionCount} projection</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{runtimeCopy.message}</p>
      <div className="mt-4 grid gap-2 text-xs text-slate-400">
        <p>Chế độ xem: <span className="capitalize text-slate-100">{focusMode}</span></p>
        <p>Phiên đang mở: <span className="text-slate-100">{activeSessions}</span></p>
        {performanceSample ? (
          <p>
            Tải cảnh: <span className="capitalize text-slate-100">{performanceSample.density}</span> ({performanceSample.renderTimeMs}ms)
          </p>
        ) : null}
        {projectionFailures > 0 ? (
          <p>
            Lỗi projection: <span className="text-amber-100">{projectionFailures}</span>
          </p>
        ) : null}
        {duplicateEventsDropped > 0 || outOfOrderEventsRejected > 0 || outOfScopeEventsRejected > 0 || malformedEventsRejected > 0 ? (
          <p>
            Bị từ chối:
            <span className="text-slate-100">
              {` dup ${duplicateEventsDropped} · order ${outOfOrderEventsRejected} · scope ${outOfScopeEventsRejected} · malformed ${malformedEventsRejected}`}
            </span>
          </p>
        ) : null}
      </div>
      {webglMessage ? <p className="mt-3 text-xs text-amber-100">{webglMessage}</p> : null}
      {staleMessage ? <p className="mt-3 text-xs text-amber-100">{staleMessage}</p> : null}
      {elevator ? (
        <div className="ops-twin-overlay-stack mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="text-base font-semibold text-slate-100">{elevator.elevatorId}</h4>
          <p>Tầng: {elevator.currentFloor}</p>
          <p>Vị trí: <span className="text-slate-100">{elevator.positionMeters ?? 'không rõ'} m</span></p>
          <p>Trạng thái: <span className="capitalize text-slate-100">{elevator.status}</span></p>
          <p>Cửa: <span className="capitalize text-slate-100">{elevator.doorState}</span> ({elevator.doorOpenPercent ?? 'n/a'}%)</p>
          <p>Tải: <span className="text-slate-100">{elevator.loadPercentage ?? 'n/a'}%</span></p>
          <p>Chế độ: <span className="capitalize text-slate-100">{elevator.mode ?? 'không rõ'}</span></p>
          <p>Sức khỏe: <span className="capitalize text-slate-100">{elevator.healthState}</span></p>
          {elevator.isPlayback ? <p className="text-sky-100">Đang hiển thị projection lịch sử.</p> : null}
          {elevator.faultCode ? <p className="text-amber-100">Lỗi: {elevator.faultCode}</p> : null}
          {elevator.stale ? <p className="text-amber-100">Trạng thái cuối đã cũ.</p> : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-3 py-4 text-slate-400">
          Chưa có thang máy nào được chọn.
        </div>
      )}
    </aside>
  );
}

function getRuntimeCopy(sceneRuntime: TwinSceneRuntimeState): { title: string; message: string } {
  if (sceneRuntime === 'ready') {
    return {
      title: 'Cảnh đã đồng bộ',
      message: 'Các projection đang khớp với trạng thái vận hành mới nhất.'
    };
  }

  if (sceneRuntime === 'empty') {
    return {
      title: 'Phạm vi cảnh đang trống',
      message: 'Chưa có projection thang máy hợp lệ cho tòa nhà hiện tại.'
    };
  }

  if (sceneRuntime === 'stale') {
    return {
      title: 'Cảnh đã cũ',
      message: 'Cảnh đang giữ vị trí thang máy cuối cùng trong lúc kết nối phục hồi.'
    };
  }

  if (sceneRuntime === 'degraded') {
    return {
      title: 'Cảnh đang suy giảm',
      message: 'Một phần dữ liệu cảnh chưa đầy đủ hoặc đang chậm hơn backend.'
    };
  }

  if (sceneRuntime === 'unavailable') {
    return {
      title: 'Không thể hiển thị cảnh',
      message: 'Trình duyệt không khởi tạo được 3D nên dashboard dùng chế độ thay thế.'
    };
  }

  return {
    title: 'Đang tải cảnh',
    message: 'Đang chuẩn bị projection Twin cho phạm vi tòa nhà hiện tại.'
  };
}
