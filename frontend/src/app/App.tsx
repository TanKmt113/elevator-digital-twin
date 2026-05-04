import React from 'react';
import { ElevatorList } from '../modules/elevator/components/ElevatorList';
import { ElevatorDetailPanel } from '../modules/elevator/components/ElevatorDetailPanel';
import { ElevatorSummaryCards } from '../modules/elevator/components/ElevatorSummaryCards';
import { AlertPanel } from '../modules/alerts/components/AlertPanel';
import { RiskWarningPanel } from '../modules/analytics/components/RiskWarningPanel';
import { TwinScene } from '../modules/twin3d/components/TwinScene';
import { useElevatorStore } from '../store/elevator-store';
import { useRealtimeStore, type DashboardDataState, type RealtimeConnectionState } from '../store/realtime-store';

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
      title: 'Loading live building state',
      message: 'Waiting for Twin bootstrap and realtime readiness.'
    };
  }

  if (dataState === 'empty' || elevatorCount === 0) {
    return {
      bannerTone: 'neutral',
      title: 'No elevators in active scope',
      message: 'No authorized elevator state is currently available for this dashboard view.'
    };
  }

  if (dataState === 'degraded' || connectionState === 'degraded' || connectionState === 'stale') {
    return {
      bannerTone: 'warning',
      title: 'Live updates are degraded',
      message: 'Showing the last accepted elevator state while synchronization recovers.'
    };
  }

  return {
    bannerTone: 'neutral',
    title: 'Twin synchronization is live',
    message: 'Dashboard projections are tracking the latest accepted operational state.'
  };
}

export function App(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const connectionState = useRealtimeStore((state) => state.connectionState);
  const dataState = useRealtimeStore((state) => state.dataState);
  const staleMessage = useRealtimeStore((state) => state.staleMessage);
  const shellState = deriveAppShellState(connectionState, dataState, elevators.length);
  const featuredElevator = elevators[0];
  const toneClasses = {
    info: 'border-sky-400/30 bg-sky-400/10 text-sky-100',
    warning: 'border-amber-300/30 bg-amber-300/10 text-amber-50',
    critical: 'border-rose-400/30 bg-rose-400/10 text-rose-50',
    neutral: 'border-white/10 bg-white/5 text-slate-100'
  } as const;

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
            Operations Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            Keangnam Smart Building Operations
          </h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {elevators.length} elevators in active scope
        </div>
      </section>
      <section className={`rounded-2xl border px-4 py-3 shadow-sm ${toneClasses[shellState.bannerTone]}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Synchronization
        </p>
        <h2 className="mt-1 text-lg font-semibold">{shellState.title}</h2>
        <p className="mt-1 text-sm text-white/80">{staleMessage ?? shellState.message}</p>
      </section>
      <ElevatorSummaryCards />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="grid gap-6">
          <ElevatorList />
          <TwinScene />
        </div>
        <div className="grid gap-6">
          {featuredElevator ? <ElevatorDetailPanel elevator={featuredElevator} /> : null}
          <AlertPanel />
          <RiskWarningPanel />
        </div>
      </section>
    </main>
  );
}
