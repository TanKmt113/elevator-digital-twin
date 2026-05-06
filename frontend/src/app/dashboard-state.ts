import type {
  DashboardDataState,
  RealtimeConnectionState,
  TwinSceneRuntimeState
} from '../store/realtime-store';

export const DASHBOARD_SECTION_TITLES = [
  'Bảng điều khiển vận hành',
  'Tổng quan thang máy',
  'Mô hình 3D',
  'Cảnh báo',
  'Cảnh báo dự đoán'
] as const;

export interface BootstrapSynchronizationState {
  bootstrapStatus?: string;
  dittoHttpState?: 'connecting' | 'live' | 'degraded';
  dittoLiveState?: string;
  frontendRealtimeState?: string;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  activeSessions?: number;
  duplicateEventsDropped?: number;
  outOfOrderEventsRejected?: number;
  outOfScopeEventsRejected?: number;
  malformedEventsRejected?: number;
  lastFailureReason?: string;
}

export function deriveAppShellState(
  connectionState: RealtimeConnectionState,
  dataState: DashboardDataState,
  elevatorCount: number
): {
  bannerTone: 'info' | 'warning' | 'critical' | 'neutral';
  title: string;
  message: string;
} {
  if (dataState === 'loading') {
    return {
      bannerTone: 'info',
      title: 'Đang tải trạng thái tòa nhà',
      message: 'Đang chờ khởi tạo Twin và kết nối thời gian thực.'
    };
  }

  if (dataState === 'empty' || elevatorCount === 0) {
    return {
      bannerTone: 'neutral',
      title: 'Chưa có thang máy trong phạm vi',
      message: 'Chưa có trạng thái thang máy hợp lệ cho màn hình hiện tại.'
    };
  }

  if (dataState === 'degraded' || connectionState === 'degraded' || connectionState === 'stale') {
    return {
      bannerTone: 'warning',
      title: 'Cập nhật trực tiếp đang suy giảm',
      message: 'Đang hiển thị trạng thái thang máy cuối cùng đã được backend chấp nhận.'
    };
  }

  if (connectionState === 'resyncing') {
    return {
      bannerTone: 'info',
      title: 'Đang đồng bộ lại dữ liệu',
      message: 'Đang tải lại snapshot mới nhất trước khi tiếp tục nhận dữ liệu trực tiếp.'
    };
  }

  return {
    bannerTone: 'neutral',
    title: 'Twin đang đồng bộ trực tiếp',
    message: 'Dashboard đang theo dõi trạng thái vận hành mới nhất đã được xác thực.'
  };
}

export function deriveRealtimeStateFromBootstrap(
  synchronization: BootstrapSynchronizationState,
  elevatorCount: number
): {
  connectionState: RealtimeConnectionState;
  dataState: DashboardDataState;
  lastBootstrapAt?: string;
  lastLiveEventAt?: string;
  duplicateEventsDropped: number;
  outOfOrderEventsRejected: number;
  staleMessage?: string;
} {
  const connectionState =
    synchronization.dittoLiveState === 'live'
      ? 'live'
      : synchronization.dittoLiveState === 'stale'
        ? 'stale'
        : synchronization.dittoLiveState === 'degraded'
          ? 'degraded'
          : 'connecting';

  const dataState =
    synchronization.bootstrapStatus === 'failed' || synchronization.bootstrapStatus === 'partial'
      ? 'degraded'
      : elevatorCount === 0 || synchronization.bootstrapStatus === 'empty'
        ? 'empty'
        : 'ready';

  return {
    connectionState,
    dataState,
    lastBootstrapAt: synchronization.lastBootstrapAt,
    lastLiveEventAt: synchronization.lastLiveEventAt,
    duplicateEventsDropped: synchronization.duplicateEventsDropped ?? 0,
    outOfOrderEventsRejected: synchronization.outOfOrderEventsRejected ?? 0,
    staleMessage: synchronization.lastFailureReason
  };
}

export function deriveSceneRuntimeState(
  connectionState: RealtimeConnectionState,
  dataState: DashboardDataState,
  projectionCount: number,
  hasWebglSupport = true
): TwinSceneRuntimeState {
  if (!hasWebglSupport) {
    return 'unavailable';
  }

  if (dataState === 'loading') {
    return 'loading';
  }

  if (dataState === 'empty' || projectionCount === 0) {
    return 'empty';
  }

  if (connectionState === 'stale' || connectionState === 'resyncing') {
    return 'stale';
  }

  if (dataState === 'degraded' || connectionState === 'degraded') {
    return 'degraded';
  }

  return 'ready';
}
