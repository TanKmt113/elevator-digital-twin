import React from 'react';

export function ElevatorStatusBadge({ status, stale }: { status: string; stale: boolean }): React.JSX.Element {
  return <span>{stale ? `STALE ${status}` : status}</span>;
}
