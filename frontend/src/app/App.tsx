import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './admin-layout';
import {
  DASHBOARD_SECTION_TITLES,
  deriveAppShellState,
  deriveRealtimeStateFromBootstrap,
  deriveSceneRuntimeState
} from './dashboard-state';
import { AlertsPage } from './pages/alerts-page';
import { AnalyticsPage } from './pages/analytics-page';
import { FleetPage } from './pages/fleet-page';
import { OverviewPage } from './pages/overview-page';
import { ScenePage } from './pages/scene-page';
import { DEFAULT_ADMIN_ROUTE } from './routes';
import { useDashboardRealtime } from './use-dashboard-realtime';

export {
  DASHBOARD_SECTION_TITLES,
  deriveAppShellState,
  deriveRealtimeStateFromBootstrap,
  deriveSceneRuntimeState
};

export function App(): React.JSX.Element {
  const { elevators, role, selectedBuildingId, shellState, staleMessage } = useDashboardRealtime();

  return (
    <Routes>
      <Route
        element={
          <AdminLayout
            elevators={elevators}
            role={role}
            selectedBuildingId={selectedBuildingId}
            shellState={shellState}
            staleMessage={staleMessage}
          />
        }
      >
        <Route index element={<Navigate to={DEFAULT_ADMIN_ROUTE.path} replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="scene" element={<ScenePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={DEFAULT_ADMIN_ROUTE.path} replace />} />
    </Routes>
  );
}
