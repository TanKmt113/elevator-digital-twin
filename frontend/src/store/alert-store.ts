import { create } from 'zustand';

export interface AlertViewModel {
  alertId: string;
  elevatorId: string;
  alertType: string;
  severity: 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  message: string;
  createdAt: string;
  acknowledgedAt?: string | null;
}

interface AlertStoreState {
  alerts: Record<string, AlertViewModel>;
  upsertAlert: (alert: AlertViewModel) => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: {},
  upsertAlert: (alert) =>
    set((state) => ({
      alerts: {
        ...state.alerts,
        [alert.alertId]: alert
      }
    }))
}));
