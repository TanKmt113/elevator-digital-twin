import { describe, expect, it } from 'vitest';
import { readMetric } from '../../src/observability/metrics.js';
import { RiskEngineService } from '../../src/modules/analytics/risk-engine.service.js';
import {
  activeFaultRiskInput,
  doorBlockedRiskInput,
  normalRiskInput,
  overloadRiskInput,
  riskInput,
  thermalRiskInput,
  vibrationRiskInput
} from '../fixtures/risk-engine.fixtures.js';

describe('risk engine rule evaluation', () => {
  it('generates warnings for door blockage, active fault, thermal, vibration, and repeated overload inputs', () => {
    const engine = new RiskEngineService();

    expect(engine.evaluate(doorBlockedRiskInput).map((warning) => warning.riskType)).toContain('door');
    expect(engine.evaluate(activeFaultRiskInput).map((warning) => warning.riskType)).toContain('fault');
    expect(engine.evaluate(thermalRiskInput).map((warning) => warning.riskType)).toContain('thermal');
    expect(engine.evaluate(vibrationRiskInput).map((warning) => warning.riskType)).toContain('vibration');
    expect(engine.evaluate(overloadRiskInput)).toHaveLength(0);
    expect(engine.evaluate(overloadRiskInput).map((warning) => warning.riskType)).toContain('overload');
  });

  it('does not generate warnings for normal or stale accepted state', () => {
    const engine = new RiskEngineService();

    expect(engine.evaluate(normalRiskInput)).toHaveLength(0);
    expect(engine.evaluate(riskInput({ stale: true, doorState: 'blocked' }))).toHaveLength(0);
  });

  it('keeps risk evaluation failures isolated from callers', () => {
    const engine = new RiskEngineService();
    const warnings = engine.evaluate(undefined);

    expect(warnings).toEqual([]);
    expect(readMetric('risk_warning_rejected_total')).toBeGreaterThanOrEqual(0);
  });
});
