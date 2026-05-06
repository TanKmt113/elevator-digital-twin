export type AdminRouteId = 'overview' | 'fleet' | 'scene' | 'alerts' | 'analytics' | 'admin';

export interface AdminRoute {
  id: AdminRouteId;
  label: string;
  path: string;
}

export const ADMIN_ROUTES: AdminRoute[] = [
  { id: 'overview', label: 'Tổng quan', path: '/overview' },
  { id: 'fleet', label: 'Đội thang', path: '/fleet' },
  { id: 'scene', label: 'Mô hình 3D', path: '/scene' },
  { id: 'alerts', label: 'Cảnh báo', path: '/alerts' },
  { id: 'analytics', label: 'Dự đoán', path: '/analytics' },
  { id: 'admin', label: 'Quản trị', path: '/admin' }
];

export const DEFAULT_ADMIN_ROUTE = ADMIN_ROUTES[0];
