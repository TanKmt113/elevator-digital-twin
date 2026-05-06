import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from './routes';
import { DASHBOARD_SECTION_TITLES, deriveAppShellState } from './dashboard-state';
import type { ElevatorViewModel } from '../store/elevator-store';
import { useSessionStore } from '../store/session-store';

function isIdleHealthySync(
  shellState: ReturnType<typeof deriveAppShellState>,
  staleMessage: string | undefined
): boolean {
  return (
    shellState.bannerTone === 'neutral' &&
    !staleMessage &&
    shellState.title === 'Twin đang đồng bộ trực tiếp'
  );
}

interface AdminLayoutProps {
  elevators: ElevatorViewModel[];
  role?: string;
  selectedBuildingId: string;
  shellState: ReturnType<typeof deriveAppShellState>;
  staleMessage?: string;
}

export function AdminLayout({
  elevators,
  role,
  selectedBuildingId,
  shellState,
  staleMessage
}: AdminLayoutProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const clearSession = useSessionStore((state) => state.clearSession);
  const isOverviewRoute =
    location.pathname === '/overview' || location.pathname === '/' || location.pathname === '';
  const showFullSyncBanner = isOverviewRoute;
  const showCompactSyncBanner = !isOverviewRoute && !isIdleHealthySync(shellState, staleMessage);

  const toneClasses = {
    info: 'border-sky-400/30 bg-sky-400/10 text-sky-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-50',
    critical: 'border-rose-400/30 bg-rose-400/10 text-rose-50',
    neutral: 'border-white/10 bg-white/5 text-slate-100'
  } as const;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
        <div className="admin-brand">
          <span className="admin-brand-mark">K</span>
          <div>
            <p className="admin-brand-eyebrow">Keangnam</p>
            <h1>Digital Twin</h1>
          </div>
        </div>
        <nav className="admin-nav">
          {ADMIN_ROUTES.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
            >
              {route.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <p className="ops-label">Phạm vi</p>
          <strong>{selectedBuildingId}</strong>
          <span>{elevators.length} thang máy đang theo dõi</span>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="ops-kicker">{DASHBOARD_SECTION_TITLES[0]}</p>
            <h2 className="admin-page-title">Vận hành tòa nhà thông minh</h2>
          </div>
          <div className="admin-topbar-actions">
            <span className="ops-scope-pill">{role ?? 'operator'}</span>
            <span className="ops-scope-pill">{selectedBuildingId}</span>
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => {
                clearSession();
                navigate('/login', { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {showFullSyncBanner ? (
          <section className={`ops-sync ops-sync-${shellState.bannerTone} ${toneClasses[shellState.bannerTone]}`}>
            <div>
              <p className="ops-label">Đồng bộ</p>
              <h2 className="ops-sync-title">{shellState.title}</h2>
            </div>
            <p className="ops-muted">{staleMessage ?? shellState.message}</p>
          </section>
        ) : null}

        {showCompactSyncBanner ? (
          <section
            className={`ops-sync ops-sync-compact ops-sync-${shellState.bannerTone} ${toneClasses[shellState.bannerTone]}`}
            aria-live="polite"
          >
            <p className="ops-label m-0 shrink-0">Đồng bộ</p>
            <p className="m-0 flex-1 text-sm font-semibold text-inherit">{shellState.title}</p>
            <p className="ops-muted m-0 max-w-[60%] truncate text-xs" title={staleMessage ?? shellState.message}>
              {staleMessage ?? shellState.message}
            </p>
          </section>
        ) : null}

        <section className="admin-page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
