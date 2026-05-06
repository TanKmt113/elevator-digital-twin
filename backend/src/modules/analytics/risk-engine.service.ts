import type { ElevatorTwin } from '../../contracts/elevator.js';
import type { RiskDriver, RiskLevel, RiskWarning } from '../../contracts/risk.js';
import {
  RISK_ACTIVE_WINDOW_MS,
  RISK_FEATURE_SET,
  RISK_RULE_IDS,
  RISK_RULE_VERSION,
  RISK_SEVERITY_ORDER,
  RISK_THRESHOLDS,
  RISK_VALIDATION_RUN_ID,
  RISK_WINDOWS_HOURS
} from './risk-rule.constants.js';
import { recordRiskEvaluated, recordRiskGenerated, recordRiskRejected, recordRiskSuppressed } from '../../observability/risk.metrics.js';

type RiskType = 'door' | 'fault' | 'thermal' | 'vibration' | 'overload';

interface RuleMatch {
  riskType: RiskType;
  ruleId: string;
  riskLevel: RiskLevel;
  predictedWindowHours: number;
  driver: RiskDriver;
}

interface ActiveWarningState {
  warning: RiskWarning;
  activeUntil: number;
}

export class RiskEngineService {
  private readonly overloadObservations = new Map<string, number>();
  private readonly activeWarnings = new Map<string, ActiveWarningState>();

  evaluate(input: unknown): RiskWarning[] {
    recordRiskEvaluated();

    try {
      if (!this.isElevatorInput(input) || input.stale) {
        return [];
      }

      const matches = this.collectMatches(input);
      const warnings = this.mergeMatches(input, matches);
      return warnings.flatMap((warning) => this.acceptOrSuppress(warning));
    } catch {
      recordRiskRejected();
      return [];
    }
  }

  private collectMatches(input: ElevatorTwin): RuleMatch[] {
    const matches: RuleMatch[] = [];

    if (input.doorState === 'blocked' || input.doorObstruction === true) {
      matches.push({
        riskType: 'door',
        ruleId: RISK_RULE_IDS.doorBlocked,
        riskLevel: input.healthState === 'critical' || input.faultCode ? 'critical' : 'high',
        predictedWindowHours: RISK_WINDOWS_HOURS.door,
        driver: {
          driverId: 'door.blocked',
          label: 'Phát hiện kẹt cửa',
          signal: input.doorObstruction === true ? 'doorObstruction' : 'doorState',
          observedValue: input.doorObstruction === true ? true : input.doorState,
          threshold: input.doorObstruction === true ? true : 'blocked',
          severityContribution: input.healthState === 'critical' || input.faultCode ? 'critical' : 'high'
        }
      });
    }

    if (input.faultCode || input.healthState === 'critical') {
      const severity = input.faultSeverity === 'critical' || input.healthState === 'critical' ? 'critical' : 'high';
      matches.push({
        riskType: 'fault',
        ruleId: RISK_RULE_IDS.activeFault,
        riskLevel: severity,
        predictedWindowHours: RISK_WINDOWS_HOURS.fault,
        driver: {
          driverId: 'fault.active',
          label: input.faultCode ? `Mã lỗi đang hoạt động: ${input.faultCode}` : 'Trạng thái sức khỏe tới hạn',
          signal: input.faultCode ? 'faultCode' : 'healthState',
          observedValue: input.faultCode ?? input.healthState,
          threshold: input.faultCode ? 'present' : 'critical',
          severityContribution: severity
        }
      });
    }

    this.addThermalMatch(matches, input, 'motorTempC', RISK_THRESHOLDS.motorTempWarningC, RISK_THRESHOLDS.motorTempCriticalC);
    this.addThermalMatch(
      matches,
      input,
      'controllerTempC',
      RISK_THRESHOLDS.controllerTempWarningC,
      RISK_THRESHOLDS.controllerTempCriticalC
    );

    const vibrationLevel = this.validNumber(input.vibrationLevel);
    if (vibrationLevel !== undefined && vibrationLevel >= RISK_THRESHOLDS.vibrationWarning) {
      const critical = vibrationLevel >= RISK_THRESHOLDS.vibrationCritical;
      matches.push({
        riskType: 'vibration',
        ruleId: RISK_RULE_IDS.vibration,
        riskLevel: critical ? 'critical' : 'high',
        predictedWindowHours: RISK_WINDOWS_HOURS.vibration,
        driver: {
          driverId: 'vibration.abnormal',
          label: 'Rung động bất thường',
          signal: 'vibrationLevel',
          observedValue: vibrationLevel,
          threshold: critical ? RISK_THRESHOLDS.vibrationCritical : RISK_THRESHOLDS.vibrationWarning,
          severityContribution: critical ? 'critical' : 'high'
        }
      });
    }

    const loadPercentage = this.validNumber(input.loadPercentage);
    const overloadCount =
      loadPercentage !== undefined && loadPercentage >= RISK_THRESHOLDS.loadOverloadPercentage
        ? (this.overloadObservations.get(input.elevatorId) ?? 0) + 1
        : 0;
    this.overloadObservations.set(input.elevatorId, overloadCount);
    if (overloadCount >= RISK_THRESHOLDS.repeatedOverloadObservations && loadPercentage !== undefined) {
      matches.push({
        riskType: 'overload',
        ruleId: RISK_RULE_IDS.repeatedOverload,
        riskLevel: overloadCount >= 3 ? 'high' : 'moderate',
        predictedWindowHours: RISK_WINDOWS_HOURS.overload,
        driver: {
          driverId: 'load.repeated-overload',
          label: 'Quá tải lặp lại',
          signal: 'loadPercentage',
          observedValue: loadPercentage,
          threshold: RISK_THRESHOLDS.loadOverloadPercentage,
          severityContribution: overloadCount >= 3 ? 'high' : 'moderate'
        }
      });
    }

    return matches;
  }

  private addThermalMatch(
    matches: RuleMatch[],
    input: ElevatorTwin,
    signal: 'motorTempC' | 'controllerTempC',
    warningThreshold: number,
    criticalThreshold: number
  ): void {
    const value = this.validNumber(input[signal]);
    if (value === undefined || value < warningThreshold) {
      return;
    }

    const critical = value >= criticalThreshold;
    matches.push({
      riskType: 'thermal',
      ruleId: RISK_RULE_IDS.thermal,
      riskLevel: critical ? 'critical' : 'high',
      predictedWindowHours: RISK_WINDOWS_HOURS.thermal,
      driver: {
        driverId: `thermal.${signal}`,
        label: signal === 'motorTempC' ? 'Nhiệt độ motor cao' : 'Nhiệt độ tủ điều khiển cao',
        signal,
        observedValue: value,
        threshold: critical ? criticalThreshold : warningThreshold,
        severityContribution: critical ? 'critical' : 'high'
      }
    });
  }

  private mergeMatches(input: ElevatorTwin, matches: RuleMatch[]): RiskWarning[] {
    const byType = new Map<RiskType, RuleMatch[]>();
    for (const match of matches) {
      byType.set(match.riskType, [...(byType.get(match.riskType) ?? []), match]);
    }

    const generatedAt = new Date().toISOString();
    return [...byType.entries()].map(([riskType, riskMatches]) => {
      const highest = riskMatches.reduce((current, next) =>
        RISK_SEVERITY_ORDER[next.riskLevel] > RISK_SEVERITY_ORDER[current.riskLevel] ? next : current
      );
      const ruleIds = [...new Set(riskMatches.map((match) => match.ruleId))];

      return {
        riskWarningId: this.warningId(input.elevatorId, riskType),
        elevatorId: input.elevatorId,
        buildingId: input.buildingId,
        riskType,
        riskLevel: highest.riskLevel,
        predictedWindowHours: Math.min(...riskMatches.map((match) => match.predictedWindowHours)),
        generatedAt,
        drivers: riskMatches.map((match) => match.driver),
        modelVersion: RISK_RULE_VERSION,
        validationRunId: RISK_VALIDATION_RUN_ID,
        verificationStatus: 'verified',
        modelTrace: {
          featureSet: RISK_FEATURE_SET,
          scoredAt: generatedAt,
          validationStatus: 'passed',
          ruleIds,
          inputCoverage: this.inputCoverage(input)
        },
        status: 'active'
      };
    });
  }

  private acceptOrSuppress(warning: RiskWarning): RiskWarning[] {
    const key = this.activeKey(warning);
    const now = Date.parse(warning.generatedAt);
    const active = this.activeWarnings.get(key);

    if (active && active.activeUntil >= now) {
      const existingLevel = active.warning.riskLevel;
      if (RISK_SEVERITY_ORDER[warning.riskLevel] <= RISK_SEVERITY_ORDER[existingLevel]) {
        active.warning.suppressedCount = (active.warning.suppressedCount ?? 0) + 1;
        active.activeUntil = now + RISK_ACTIVE_WINDOW_MS;
        recordRiskSuppressed();
        return [];
      }

      const escalated = {
        ...active.warning,
        ...warning,
        generatedAt: active.warning.generatedAt,
        updatedAt: warning.generatedAt,
        suppressedCount: active.warning.suppressedCount
      };
      this.activeWarnings.set(key, {
        warning: escalated,
        activeUntil: now + RISK_ACTIVE_WINDOW_MS
      });
      recordRiskGenerated();
      return [escalated];
    }

    this.activeWarnings.set(key, {
      warning,
      activeUntil: now + RISK_ACTIVE_WINDOW_MS
    });
    recordRiskGenerated();
    return [warning];
  }

  private warningId(elevatorId: string, riskType: RiskType): string {
    return `risk-${elevatorId}-${riskType}`;
  }

  private activeKey(warning: RiskWarning): string {
    return `${warning.elevatorId}:${warning.riskType ?? warning.riskWarningId}`;
  }

  private inputCoverage(input: ElevatorTwin): Record<string, boolean> {
    return {
      doorState: Boolean(input.doorState),
      doorObstruction: input.doorObstruction !== undefined,
      faultCode: Boolean(input.faultCode),
      healthState: Boolean(input.healthState),
      motorTempC: this.validNumber(input.motorTempC) !== undefined,
      controllerTempC: this.validNumber(input.controllerTempC) !== undefined,
      vibrationLevel: this.validNumber(input.vibrationLevel) !== undefined,
      loadPercentage: this.validNumber(input.loadPercentage) !== undefined
    };
  }

  private validNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  private isElevatorInput(value: unknown): value is ElevatorTwin {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Record<string, unknown>;
    return typeof record.elevatorId === 'string' && typeof record.buildingId === 'string';
  }
}
