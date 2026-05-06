import type {
  ElevatorTwin,
  RealtimeSynchronizationState,
  TwinBootstrapSnapshot
} from '../../contracts/elevator.js';
import {
  DITTO_ELEVATOR_FIELDS,
  projectDittoElevatorThing,
  type DittoClient
} from '../../integrations/ditto/ditto-client.js';
import { ElevatorStateRepository } from './elevator-state.repository.js';
import { SessionStalenessPolicy } from '../realtime/session-manager.js';
import { normalizeTwinBootstrapProjection } from '../realtime/event-normalizer.js';
import { settings } from '../../config/settings.js';
import {
  recordSynchronizationDegraded,
  recordTwinBootstrapCompleted,
  recordTwinBootstrapFailed,
  recordTwinBootstrapStarted,
  recordNormalizationFailure
} from '../../observability/elevator-monitoring.metrics.js';
import { logger } from '../../observability/logger.js';

function createInitialSynchronizationState(staleThresholdMs: number): RealtimeSynchronizationState {
  return {
    connectionState: 'connecting',
    bootstrapStatus: 'idle',
    dataState: 'loading',
    dittoHttpState: 'connecting',
    dittoLiveState: 'connecting',
    frontendRealtimeState: 'connecting',
    staleThresholdMs,
    activeSessions: 0,
    duplicateEventsDropped: 0,
    outOfOrderEventsRejected: 0,
    outOfScopeEventsRejected: 0,
    malformedEventsRejected: 0,
    hydrationFailures: 0,
    normalizationFailures: 0,
    commandPolicyRejections: 0
  };
}

export class ElevatorMonitoringService {
  private synchronizationState = createInitialSynchronizationState(settings.staleThresholdMs);
  private bootstrapSnapshot?: TwinBootstrapSnapshot;

  constructor(
    private readonly repository = new ElevatorStateRepository(),
    private readonly stalenessPolicy = new SessionStalenessPolicy(),
    private readonly dittoClient?: Pick<DittoClient, 'listThings'>
  ) {
    this.synchronizationState = createInitialSynchronizationState(settings.staleThresholdMs);
  }

  async bootstrapFromDitto(): Promise<ElevatorTwin[]> {
    if (!this.dittoClient) {
      this.synchronizationState = {
        ...this.synchronizationState,
        bootstrapStatus: 'failed',
        connectionState: 'degraded',
        dataState: 'degraded',
        dittoHttpState: 'degraded',
        dittoLiveState: 'degraded',
        lastFailureReason: 'ditto_client_unavailable'
      };
      recordTwinBootstrapFailed();
      return this.list();
    }

    recordTwinBootstrapStarted();
    const requestedAt = new Date().toISOString();
    this.synchronizationState = {
      ...this.synchronizationState,
      bootstrapStatus: 'loading',
      dataState: 'loading',
      connectionState: 'connecting',
      dittoHttpState: 'connecting',
      lastFailureReason: undefined
    };

    try {
      const things = await this.dittoClient.listThings({
        fields: DITTO_ELEVATOR_FIELDS,
        timeout: `${settings.bootstrapTimeoutMs}ms`
      });

      const hydratedTwins = things
        .map((thing) => normalizeTwinBootstrapProjection(projectDittoElevatorThing(thing)))
        .filter((twin): twin is ElevatorTwin => twin !== null)
        .map((twin) => this.upsert(twin));

      const completedAt = new Date().toISOString();
      this.bootstrapSnapshot = {
        snapshotId: `bootstrap-${completedAt}`,
        buildingId: hydratedTwins[0]?.buildingId ?? 'unknown',
        source: 'twin',
        requestedAt,
        completedAt,
        status: hydratedTwins.length > 0 ? 'completed' : 'empty',
        elevators: hydratedTwins,
        missingElevatorIds: hydratedTwins.length > 0 ? undefined : []
      };
      this.synchronizationState = {
        ...this.synchronizationState,
        buildingId: hydratedTwins[0]?.buildingId,
        bootstrapStatus: hydratedTwins.length > 0 ? 'completed' : 'empty',
        dataState: hydratedTwins.length > 0 ? 'ready' : 'empty',
        connectionState: hydratedTwins.length > 0 ? 'live' : 'degraded',
        dittoHttpState: 'live',
        lastBootstrapAt: completedAt,
        lastLiveEventAt: hydratedTwins[0]?.lastEventAt
      };
      recordTwinBootstrapCompleted();
      if (hydratedTwins.length === 0) {
        recordSynchronizationDegraded();
      }

      return hydratedTwins;
    } catch (error) {
      this.synchronizationState = {
        ...this.synchronizationState,
        bootstrapStatus: 'failed',
        dataState: 'degraded',
        connectionState: 'degraded',
        dittoHttpState: 'degraded',
        dittoLiveState: 'degraded',
        lastFailureReason: error instanceof Error ? error.message : 'unknown_bootstrap_failure'
      };
      this.bootstrapSnapshot = {
        snapshotId: `bootstrap-failed-${requestedAt}`,
        buildingId: 'unknown',
        source: 'twin',
        requestedAt,
        completedAt: new Date().toISOString(),
        status: 'failed',
        elevators: [],
        failureReason: this.synchronizationState.lastFailureReason
      };
      recordTwinBootstrapFailed();
      recordSynchronizationDegraded();
      throw error;
    }
  }

  async refreshFromDitto(): Promise<ElevatorTwin[]> {
    return this.bootstrapFromDitto();
  }

  upsert(twin: ElevatorTwin): ElevatorTwin {
    let saved: ElevatorTwin;
    try {
      saved = this.repository.save({
        ...twin,
        stale: this.stalenessPolicy.isStale(twin.lastEventAt)
      });
    } catch (error) {
      recordNormalizationFailure();
      this.synchronizationState = {
        ...this.synchronizationState,
        normalizationFailures: (this.synchronizationState.normalizationFailures ?? 0) + 1
      };
      logger.error('elevator_twin_normalization_rejected', {
        elevatorId: twin.elevatorId,
        buildingId: twin.buildingId,
        error: error instanceof Error ? error.message : 'unknown_validation_error'
      });
      throw error;
    }
    this.synchronizationState = {
      ...this.synchronizationState,
      buildingId: saved.buildingId,
      dataState: this.repository.list().length > 0 ? 'ready' : 'empty',
      connectionState: this.stalenessPolicy.connectionStateFor(saved.lastEventAt),
      dittoLiveState: 'live',
      lastLiveEventAt: saved.lastEventAt
    };
    return saved;
  }

  setFrontendRealtimeState(connectionState: RealtimeSynchronizationState['frontendRealtimeState'], activeSessions: number): void {
    this.synchronizationState = {
      ...this.synchronizationState,
      frontendRealtimeState: connectionState,
      activeSessions
    };
  }

  setDittoLiveState(
    connectionState: RealtimeSynchronizationState['dittoLiveState'],
    lastFailureReason?: string
  ): void {
    this.synchronizationState = {
      ...this.synchronizationState,
      dittoLiveState: connectionState,
      lastFailureReason: lastFailureReason ?? this.synchronizationState.lastFailureReason
    };
  }

  setRejectionStats(stats: {
    duplicateEventsDropped?: number;
    outOfOrderEventsRejected?: number;
    outOfScopeEventsRejected?: number;
    malformedEventsRejected?: number;
    hydrationFailures?: number;
    normalizationFailures?: number;
    commandPolicyRejections?: number;
  }): void {
    this.synchronizationState = {
      ...this.synchronizationState,
      duplicateEventsDropped:
        stats.duplicateEventsDropped ?? this.synchronizationState.duplicateEventsDropped,
      outOfOrderEventsRejected:
        stats.outOfOrderEventsRejected ?? this.synchronizationState.outOfOrderEventsRejected,
      outOfScopeEventsRejected:
        stats.outOfScopeEventsRejected ?? this.synchronizationState.outOfScopeEventsRejected,
      malformedEventsRejected:
        stats.malformedEventsRejected ?? this.synchronizationState.malformedEventsRejected,
      hydrationFailures: stats.hydrationFailures ?? this.synchronizationState.hydrationFailures,
      normalizationFailures: stats.normalizationFailures ?? this.synchronizationState.normalizationFailures,
      commandPolicyRejections:
        stats.commandPolicyRejections ?? this.synchronizationState.commandPolicyRejections
    };
  }

  list(): ElevatorTwin[] {
    return this.repository.list().map((twin) => ({
      ...twin,
      stale: this.stalenessPolicy.isStale(twin.lastEventAt)
    }));
  }

  listByBuilding(buildingId: string): ElevatorTwin[] {
    return this.repository.listByBuilding(buildingId).map((twin) => ({
      ...twin,
      stale: this.stalenessPolicy.isStale(twin.lastEventAt)
    }));
  }

  get(elevatorId: string): ElevatorTwin | undefined {
    const twin = this.repository.get(elevatorId);
    return twin
      ? {
          ...twin,
          stale: this.stalenessPolicy.isStale(twin.lastEventAt)
        }
      : undefined;
  }

  getSynchronizationState(): RealtimeSynchronizationState {
    return {
      ...this.synchronizationState,
      connectionState: this.stalenessPolicy.connectionStateFor(
        this.synchronizationState.lastLiveEventAt,
        this.synchronizationState.connectionState === 'degraded'
      )
    };
  }

  getBootstrapSnapshot(): TwinBootstrapSnapshot | undefined {
    return this.bootstrapSnapshot;
  }
}
