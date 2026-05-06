import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/api/server.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';
import { validateElevatorTwinForPublication } from '../../src/modules/elevators/elevator-twin.validation.js';
import { hasBuildingScope } from '../../src/modules/auth/auth.middleware.js';
import {
  normalizeJwtPayload,
  principalToUserContext
} from '../../src/modules/auth/auth.types.js';

describe('elevators contract', () => {
  it('defines scoped list/detail endpoints and synchronization metadata', () => {
    const { monitoringService } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    expect(['/elevators', '/elevators/:elevatorId']).toHaveLength(2);
    expect(monitoringService.getSynchronizationState()).toMatchObject({
      bootstrapStatus: expect.any(String),
      dataState: expect.any(String),
      connectionState: expect.any(String),
      duplicateEventsDropped: expect.any(Number),
      outOfOrderEventsRejected: expect.any(Number),
      outOfScopeEventsRejected: expect.any(Number),
      malformedEventsRejected: expect.any(Number),
      hydrationFailures: expect.any(Number),
      normalizationFailures: expect.any(Number),
      commandPolicyRejections: expect.any(Number)
    });
  });

  it('requires building scope for detail lookup semantics', () => {
    const { monitoringService } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    monitoringService.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72' }));

    expect(monitoringService.get('A')).toMatchObject({ buildingId: 'L72' });
    expect(monitoringService.listByBuilding('L30')).toEqual([]);
  });

  it('exposes enhanced elevator twin schema fields', () => {
    const twin = createElevatorTwin({
      elevatorId: 'A',
      buildingId: 'L72',
      currentFloor: 4,
      targetFloor: 8,
      positionMeters: 12.6,
      floorProgress: 0.42,
      speedMps: 1.5,
      accelerationMps2: 0.2,
      doorOpenPercent: 45,
      loadKg: 340,
      ratedLoadKg: 1000,
      mode: 'normal',
      brakeState: 'released',
      motorState: 'running',
      controllerState: 'normal',
      motorTempC: 38,
      controllerTempC: 31,
      powerKw: 11.2,
      vibrationLevel: 0.18,
      faultCode: 'WARN-1',
      faultSeverity: 'warning',
      activeCalls: [{ floor: 8, direction: 'up', type: 'hall' }],
      stopQueue: [8],
      etaSeconds: 16
    });

    expect(twin).toMatchObject({
      schemaVersion: '1.1.0',
      deviceType: 'elevator',
      positionMeters: 12.6,
      floorProgress: 0.42,
      doorOpenPercent: 45,
      loadKg: 340,
      mode: 'normal',
      brakeState: 'released',
      motorState: 'running',
      controllerState: 'normal',
      activeCalls: [{ floor: 8, direction: 'up', type: 'hall' }],
      stopQueue: [8],
      etaSeconds: 16
    });
  });

  it('validates publication-ready enhanced elevator twins', () => {
    const twin = createElevatorTwin({
      elevatorId: 'A',
      buildingId: 'L72',
      doorOpenPercent: 50,
      floorProgress: 0.5,
      lastEventAt: '2026-05-06T01:18:13.576Z'
    });

    expect(twin).toMatchObject({
      schemaVersion: '1.1.0',
      doorOpenPercent: 50,
      floorProgress: 0.5
    });
    expect(validateElevatorTwinForPublication(twin)).toEqual({ valid: true, errors: [] });
  });

  it('enforces token building scope equality for elevator access', () => {
    const scopedPrincipal = normalizeJwtPayload({
      sub: 'operator-1',
      userId: 'operator-1',
      role: 'operator',
      buildingId: 'L72'
    });
    expect(
      hasBuildingScope(
        {
          principal: scopedPrincipal,
          user: principalToUserContext(scopedPrincipal)
        } as never,
        'L72'
      )
    ).toBe(true);
    expect(
      hasBuildingScope(
        {
          principal: scopedPrincipal,
          user: principalToUserContext(scopedPrincipal)
        } as never,
        'L30'
      )
    ).toBe(false);
  });
});
