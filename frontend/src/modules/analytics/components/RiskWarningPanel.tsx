import React from 'react';
import { useRiskStore } from '../../../store/risk-store';

export function RiskWarningPanel(): React.JSX.Element {
  const warnings = Object.values(useRiskStore((state) => state.warnings));
  return (
    <section>
      <h2>Predictive Warnings</h2>
      {warnings.map((warning) => (
        <article key={warning.riskWarningId}>
          <strong>{warning.elevatorId}</strong>
          <p>Risk: {warning.riskLevel}</p>
          <p>Window: {warning.predictedWindowHours}h</p>
        </article>
      ))}
    </section>
  );
}
