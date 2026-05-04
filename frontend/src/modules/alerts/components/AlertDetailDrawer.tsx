import React from 'react';
import type { AlertViewModel } from '../../../store/alert-store';

export function AlertDetailDrawer({ alert }: { alert: AlertViewModel }): JSX.Element {
  return (
    <aside>
      <h2>{alert.alertType}</h2>
      <p>{alert.message}</p>
      <p>Status: {alert.status}</p>
    </aside>
  );
}
