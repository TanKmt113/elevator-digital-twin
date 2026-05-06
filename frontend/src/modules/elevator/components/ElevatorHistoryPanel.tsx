import React from 'react';
import { useHistoryStore } from '../../../store/history-store';
import { useElevatorStore } from '../../../store/elevator-store';
import { useSessionStore } from '../../../store/session-store';
import { fetchElevatorHistory } from '../services/fetch-elevator-history';
import { ElevatorHistoryChart } from './ElevatorHistoryChart';

const EMPTY_HISTORY_POINTS: readonly [] = [];

export function ElevatorHistoryPanel({ elevatorId }: { elevatorId: string }): React.JSX.Element {
  const points = useHistoryStore((state) => state.historyByElevator[elevatorId] ?? EMPTY_HISTORY_POINTS);
  const meta = useHistoryStore((state) => state.metaByElevator[elevatorId]);
  const playbackElevatorId = useHistoryStore((state) => state.playbackElevatorId);
  const selectedBuildingId = useElevatorStore((state) => state.selectedBuildingId);
  const token = useSessionStore((state) => state.token);
  const isPlaybackActive = playbackElevatorId === elevatorId;

  return (
    <section className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Lịch sử</p>
          <p className="text-slate-300">
            {isPlaybackActive ? 'Đang xem phát lại lịch sử' : 'Vẫn giữ chế độ trực tiếp'}
          </p>
        </div>
        {meta?.partial ? <span className="text-amber-100">Dữ liệu một phần</span> : null}
      </div>
      <button
        type="button"
        onClick={() => {
          void fetchElevatorHistory(elevatorId, {
            buildingId: selectedBuildingId,
            token
          });
        }}
      >
        Tải lịch sử
      </button>
      {meta?.from && meta.to ? (
        <p className="text-xs text-slate-400">
          Khoảng thời gian: {meta.from} đến {meta.to} ({meta.resolution ?? 'n/a'})
        </p>
      ) : null}
      {points.some((point) => point.partial) ? (
        <p className="text-xs text-amber-100">
          Một số snapshot thiếu dữ liệu: {points.flatMap((point) => point.missingFields ?? []).join(', ') || 'trường không rõ'}
        </p>
      ) : null}
      <ElevatorHistoryChart points={points} />
    </section>
  );
}
