const statusLabels: Record<string, string> = {
  idle: 'Đang chờ',
  moving: 'Đang chạy',
  door_open: 'Cửa đang mở',
  maintenance: 'Bảo trì',
  fault: 'Lỗi',
  offline: 'Mất kết nối',
  unknown: 'Không xác định'
};

const directionLabels: Record<string, string> = {
  up: 'Đi lên',
  down: 'Đi xuống',
  stationary: 'Đứng yên',
  unknown: 'Không xác định'
};

const doorStateLabels: Record<string, string> = {
  open: 'Mở',
  closed: 'Đóng',
  opening: 'Đang mở',
  closing: 'Đang đóng',
  blocked: 'Bị chặn',
  unknown: 'Không xác định'
};

const healthLabels: Record<string, string> = {
  normal: 'Bình thường',
  warning: 'Cảnh báo',
  critical: 'Nghiêm trọng',
  unknown: 'Không xác định'
};

export function translateElevatorStatus(status: string | undefined): string {
  const key = status?.trim().toLowerCase() || 'unknown';
  return statusLabels[key] ?? 'Không xác định';
}

export function translateDirection(direction: string | undefined): string {
  const key = direction?.trim().toLowerCase() || 'unknown';
  return directionLabels[key] ?? 'Không xác định';
}

export function translateDoorState(doorState: string | undefined): string {
  const key = doorState?.trim().toLowerCase() || 'unknown';
  return doorStateLabels[key] ?? 'Không xác định';
}

export function translateHealthState(healthState: string | undefined): string {
  const key = healthState?.trim().toLowerCase() || 'unknown';
  return healthLabels[key] ?? 'Không xác định';
}
