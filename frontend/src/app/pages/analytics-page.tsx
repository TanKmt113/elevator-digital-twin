import React from 'react';
import { RiskWarningPanel } from '../../modules/analytics/components/RiskWarningPanel';
import { fetchRiskWarnings } from '../../services/api/client';
import { useRiskStore } from '../../store/risk-store';
import { useSessionStore } from '../../store/session-store';

export function AnalyticsPage(): React.JSX.Element {
  const token = useSessionStore((state) => state.token);

  React.useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    void fetchRiskWarnings(token)
      .then((response) => {
        if (!cancelled) {
          useRiskStore.getState().replaceWarnings(response.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          useRiskStore.getState().replaceWarnings([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return <RiskWarningPanel />;
}
