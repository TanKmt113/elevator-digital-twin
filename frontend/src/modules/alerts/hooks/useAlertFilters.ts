import { useState } from 'react';

export function useAlertFilters() {
  const [severity, setSeverity] = useState<'all' | 'warning' | 'critical'>('all');
  return { severity, setSeverity };
}
