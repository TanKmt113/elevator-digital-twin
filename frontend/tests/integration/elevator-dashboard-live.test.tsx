import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { deriveAppShellState, deriveSceneRuntimeState } from '../../src/app/App';
import { ElevatorDetailPanel } from '../../src/modules/elevator/components/ElevatorDetailPanel';
import { ElevatorSummaryCards } from '../../src/modules/elevator/components/ElevatorSummaryCards';
import { handleRealtimeEvent } from '../../src/services/realtime/elevator-events';
import { useElevatorStore } from '../../src/store/elevator-store';
import { useRealtimeStore } from '../../src/store/realtime-store';

describe('elevator dashboard live updates', () => {
  it('derives loading and empty dashboard states', () => {
    expect(deriveAppShellState('connecting', 'loading', 0).title).toBe('Đang tải trạng thái tòa nhà');
    expect(deriveAppShellState('live', 'empty', 0).title).toBe('Chưa có thang máy trong phạm vi');
  });

  it('stores incoming realtime elevator state', () => {
    useRealtimeStore.setState({
      connected: false,
      connectionState: 'connecting',
      dataState: 'loading',
      duplicateEventsDropped: 0,
      outOfOrderEventsRejected: 0,
      staleMessage: undefined
    });
    handleRealtimeEvent({
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 12,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });
    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(12);
    expect(useRealtimeStore.getState().dataState).toBe('ready');
    expect(useRealtimeStore.getState().sceneRuntime).toBe('ready');
    expect(deriveAppShellState('live', 'ready', 1).title).toBe('Twin đang đồng bộ trực tiếp');
  });

  it('stores and renders enhanced elevator state fields', () => {
    handleRealtimeEvent({
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        buildingId: 'L72',
        schemaVersion: '1.1.0',
        status: 'moving',
        currentFloor: 4,
        targetFloor: 8,
        positionMeters: 12.6,
        speedMps: 1.5,
        direction: 'up',
        doorState: 'opening',
        doorOpenPercent: 45,
        loadKg: 340,
        ratedLoadKg: 1000,
        loadPercentage: 34,
        occupancyEstimate: 5,
        mode: 'normal',
        brakeState: 'released',
        motorState: 'running',
        controllerState: 'normal',
        motorTempC: 38,
        powerKw: 11.2,
        vibrationLevel: 0.18,
        healthState: 'normal',
        faultCode: 'WARN-1',
        faultSeverity: 'warning',
        stopQueue: [8],
        etaSeconds: 16,
        stale: false
      }
    });

    const elevator = useElevatorStore.getState().elevators.A;
    expect(elevator).toMatchObject({
      positionMeters: 12.6,
      doorOpenPercent: 45,
      loadKg: 340,
      mode: 'normal',
      motorState: 'running',
      stopQueue: [8]
    });
    const markup = renderToStaticMarkup(<ElevatorDetailPanel elevator={elevator} />);
    expect(markup).toContain('Độ mở cửa');
    expect(markup).toContain('45%');
    expect(markup).toContain('Tải kg');
    expect(markup).toContain('WARN-1');
  });

  it('renders unknown placeholders and partial-state messaging for missing enhanced fields', () => {
    const markup = renderToStaticMarkup(
      <ElevatorDetailPanel
        elevator={{
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'idle',
          currentFloor: 1,
          direction: 'stationary',
          doorState: 'unknown',
          healthState: 'unknown',
          stale: true
        }}
      />
    );

    expect(markup).toContain('Dữ liệu Twin chưa đầy đủ');
    expect(markup).toContain('Dữ liệu trực tiếp đã cũ');
    expect(markup).toContain('Không xác định');
  });

  it('merges partial enhanced frontend updates with the last accepted state', () => {
    useElevatorStore.setState({ elevators: {} });
    useElevatorStore.getState().upsertElevator({
      elevatorId: 'A',
      buildingId: 'L72',
      status: 'moving',
      currentFloor: 4,
      direction: 'up',
      doorState: 'closed',
      doorOpenPercent: 0,
      loadKg: 340,
      healthState: 'normal',
      stale: false
    });
    useElevatorStore.getState().upsertElevator({
      elevatorId: 'A',
      status: 'moving',
      currentFloor: 4,
      direction: 'up',
      doorState: 'opening',
      doorOpenPercent: 45,
      healthState: 'normal',
      stale: false
    });

    expect(useElevatorStore.getState().elevators.A).toMatchObject({
      buildingId: 'L72',
      doorOpenPercent: 45,
      loadKg: 340
    });
  });

  it('ignores duplicate realtime elevator event ids', () => {
    useElevatorStore.setState({ elevators: {} });
    handleRealtimeEvent({
      eventId: 'evt-duplicate',
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 5,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });
    handleRealtimeEvent({
      eventId: 'evt-duplicate',
      eventType: 'elevator.state.changed',
      payload: {
        elevatorId: 'A',
        status: 'moving',
        currentFloor: 9,
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal',
        stale: false
      }
    });

    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(5);
  });

  it('stores backend synchronization state events', () => {
    handleRealtimeEvent({
      eventType: 'system.connection.state',
      payload: {
        frontendRealtimeState: 'degraded',
        connectionState: 'degraded',
        dataState: 'degraded',
        activeSessions: 2,
        duplicateEventsDropped: 2,
        outOfOrderEventsRejected: 1,
        outOfScopeEventsRejected: 4,
        malformedEventsRejected: 3,
        hydrationFailures: 5,
        normalizationFailures: 6,
        commandPolicyRejections: 7,
        lastFailureReason: 'ditto unavailable'
      }
    });

    expect(useRealtimeStore.getState()).toMatchObject({
      connected: false,
      connectionState: 'degraded',
      dataState: 'degraded',
      frontendRealtimeState: 'degraded',
      activeSessions: 2,
      sceneRuntime: 'degraded',
      duplicateEventsDropped: 2,
      outOfOrderEventsRejected: 1,
      outOfScopeEventsRejected: 4,
      malformedEventsRejected: 3,
      hydrationFailures: 5,
      normalizationFailures: 6,
      commandPolicyRejections: 7,
      staleMessage: 'ditto unavailable'
    });
    expect(renderToStaticMarkup(<ElevatorSummaryCards />)).toContain('Bị từ chối');
  });

  it('keeps the last accepted elevator state while rejected-event counters increase', () => {
    useElevatorStore.setState({
      elevators: {
        A: {
          elevatorId: 'A',
          buildingId: 'L72',
          status: 'moving',
          currentFloor: 6,
          direction: 'up',
          doorState: 'closed',
          healthState: 'normal',
          stale: false
        }
      }
    });

    handleRealtimeEvent({
      eventType: 'system.connection.state',
      payload: {
        connectionState: 'degraded',
        dataState: 'ready',
        duplicateEventsDropped: 1,
        outOfOrderEventsRejected: 2,
        outOfScopeEventsRejected: 3,
        malformedEventsRejected: 4
      }
    });

    expect(useElevatorStore.getState().elevators.A?.currentFloor).toBe(6);
    expect(useRealtimeStore.getState()).toMatchObject({
      duplicateEventsDropped: 1,
      outOfOrderEventsRejected: 2,
      outOfScopeEventsRejected: 3,
      malformedEventsRejected: 4
    });
  });

  it('switches to resyncing and invokes recovery callback when resync is required', () => {
    let resyncInvoked = false;

    handleRealtimeEvent(
      {
        eventType: 'dashboard.resync.required',
        payload: {
          buildingId: 'L72',
          reason: 'live_reconnected',
          requestedAt: '2026-05-05T10:00:00.000Z'
        }
      },
      {
        onResyncRequired: () => {
          resyncInvoked = true;
        }
      }
    );

    expect(useRealtimeStore.getState().connectionState).toBe('resyncing');
    expect(resyncInvoked).toBe(true);
  });

  it('keeps scene runtime stale during live synchronization delay', () => {
    expect(deriveSceneRuntimeState('stale', 'ready', 2)).toBe('stale');
  });

  it('keeps scene unavailable when rendering support is missing', () => {
    expect(deriveSceneRuntimeState('live', 'ready', 2, false)).toBe('unavailable');
  });
});
