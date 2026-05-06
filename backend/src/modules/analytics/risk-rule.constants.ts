import type { RiskLevel } from '../../contracts/risk.js';

export const RISK_RULE_VERSION = 'risk-rules-v1';
export const RISK_VALIDATION_RUN_ID = 'risk-engine-v1';
export const RISK_FEATURE_SET = 'risk-rule-engine-v1';
export const RISK_ACTIVE_WINDOW_MS = 30 * 60 * 1000;

export const RISK_RULE_IDS = {
  doorBlocked: 'door.blocked.v1',
  activeFault: 'fault.active.v1',
  thermal: 'thermal.overtemp.v1',
  vibration: 'vibration.abnormal.v1',
  repeatedOverload: 'load.repeated-overload.v1'
} as const;

export const RISK_THRESHOLDS = {
  motorTempWarningC: 80,
  motorTempCriticalC: 95,
  controllerTempWarningC: 75,
  controllerTempCriticalC: 90,
  vibrationWarning: 5,
  vibrationCritical: 8,
  loadOverloadPercentage: 110,
  repeatedOverloadObservations: 2
} as const;

export const RISK_WINDOWS_HOURS: Record<string, number> = {
  door: 12,
  fault: 24,
  thermal: 48,
  vibration: 72,
  overload: 96
};

export const RISK_SEVERITY_ORDER: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4
};
