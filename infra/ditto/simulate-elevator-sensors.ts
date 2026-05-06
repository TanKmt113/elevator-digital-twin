interface ElevatorSensorState {
  thingId: string;
  buildingId: string;
  shaftId: string;
  currentFloor: number;
  targetFloor: number;
  doorOpenPercent: number;
  doorState: 'open' | 'closed' | 'opening' | 'closing' | 'blocked';
  direction: 'up' | 'down' | 'stationary';
  phase: 'idle' | 'doors_closing' | 'moving' | 'doors_opening';
  loadPercentage: number;
  doorCycleCount: number;
  healthState: 'normal' | 'warning' | 'critical';
  faultCode: string | null;
  faultSeverity: string | null;
  lastFaultAt: string | null;
  faultTicksRemaining: number;
  scenario: RiskScenario | null;
  scenarioTicksRemaining: number;
}

const apiBaseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const intervalMs = Number(process.env.SENSOR_INTERVAL_MS ?? '1200');
const maxFloor = Number(process.env.SENSOR_MAX_FLOOR ?? '32');
const minFloor = Number(process.env.SENSOR_MIN_FLOOR ?? '1');
const seedFirst = process.env.SENSOR_SEED_FIRST !== 'false';
const riskScenariosEnabled = process.env.SENSOR_RISK_SCENARIOS !== 'false';
const scenarioEveryTicks = Number(process.env.SENSOR_RISK_EVERY_TICKS ?? '8');

type RiskScenario = 'door_blocked' | 'active_fault' | 'thermal' | 'vibration' | 'overload';

const scenarioPlan: Array<{ elevatorIndex: number; scenario: RiskScenario; durationTicks: number }> = [
  { elevatorIndex: 0, scenario: 'door_blocked', durationTicks: 4 },
  { elevatorIndex: 1, scenario: 'thermal', durationTicks: 4 },
  { elevatorIndex: 2, scenario: 'vibration', durationTicks: 4 },
  { elevatorIndex: 0, scenario: 'overload', durationTicks: 4 },
  { elevatorIndex: 1, scenario: 'active_fault', durationTicks: 4 }
];

let tickCount = 0;
let scenarioCursor = 0;

const elevators: ElevatorSensorState[] = [
  createElevator('org.example:L72-ELEV-A', 'shaft-a', 1, 8, 22),
  createElevator('org.example:L72-ELEV-B', 'shaft-b', 12, 18, 61),
  createElevator('org.example:L72-ELEV-C', 'shaft-c', 5, 3, 0)
];

function createElevator(
  thingId: string,
  shaftId: string,
  currentFloor: number,
  targetFloor: number,
  loadPercentage: number
): ElevatorSensorState {
  return {
    thingId,
    buildingId: 'L72',
    shaftId,
    currentFloor,
    targetFloor,
    doorOpenPercent: currentFloor === targetFloor ? 100 : 0,
    doorState: currentFloor === targetFloor ? 'open' : 'closed',
    direction: currentFloor < targetFloor ? 'up' : currentFloor > targetFloor ? 'down' : 'stationary',
    phase: currentFloor === targetFloor ? 'idle' : 'moving',
    loadPercentage,
    doorCycleCount: 1000 + Math.floor(Math.random() * 1800),
    healthState: 'normal',
    faultCode: null,
    faultSeverity: null,
    lastFaultAt: null,
    faultTicksRemaining: 0,
    scenario: null,
    scenarioTicksRemaining: 0
  };
}

function chooseTarget(currentFloor: number): number {
  let next = currentFloor;
  while (next === currentFloor) {
    next = minFloor + Math.floor(Math.random() * (maxFloor - minFloor + 1));
  }
  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function vary(value: number, delta: number, min: number, max: number): number {
  return clamp(value + (Math.random() * delta * 2 - delta), min, max);
}

function applyScheduledScenario(): void {
  if (!riskScenariosEnabled || tickCount === 0 || tickCount % scenarioEveryTicks !== 0) {
    return;
  }

  const next = scenarioPlan[scenarioCursor % scenarioPlan.length];
  scenarioCursor += 1;
  const elevator = elevators[next.elevatorIndex];
  elevator.scenario = next.scenario;
  elevator.scenarioTicksRemaining = next.durationTicks;
  elevator.lastFaultAt = new Date().toISOString();

  console.log(
    `${new Date().toISOString()} scenario=${next.scenario} elevator=${elevator.thingId} durationTicks=${next.durationTicks}`
  );
}

function clearScenario(e: ElevatorSensorState): void {
  e.scenario = null;
  e.scenarioTicksRemaining = 0;
  e.faultCode = null;
  e.faultSeverity = null;
  e.lastFaultAt = null;
  e.healthState = 'normal';
  if (e.doorState === 'blocked') {
    e.doorState = 'open';
    e.doorOpenPercent = 100;
  }
}

function tickScenario(e: ElevatorSensorState): boolean {
  if (!e.scenario || e.scenarioTicksRemaining <= 0) {
    if (e.scenario) {
      clearScenario(e);
    }
    return false;
  }

  e.scenarioTicksRemaining -= 1;
  e.direction = 'stationary';
  e.phase = 'idle';

  switch (e.scenario) {
    case 'door_blocked':
      e.doorState = 'blocked';
      e.doorOpenPercent = 62;
      e.healthState = 'critical';
      e.faultCode = 'DOOR-BLOCKED';
      e.faultSeverity = 'critical';
      break;
    case 'active_fault':
      e.doorState = 'closed';
      e.doorOpenPercent = 0;
      e.healthState = 'critical';
      e.faultCode = 'BRAKE-CONTROLLER-FAULT';
      e.faultSeverity = 'critical';
      break;
    case 'thermal':
      e.doorState = 'closed';
      e.doorOpenPercent = 0;
      e.healthState = 'warning';
      e.faultCode = null;
      e.faultSeverity = null;
      break;
    case 'vibration':
      e.doorState = 'closed';
      e.doorOpenPercent = 0;
      e.healthState = 'warning';
      e.faultCode = null;
      e.faultSeverity = null;
      break;
    case 'overload':
      e.doorState = 'closed';
      e.doorOpenPercent = 0;
      e.healthState = 'warning';
      e.faultCode = null;
      e.faultSeverity = null;
      e.loadPercentage = 118;
      break;
  }

  return true;
}

function tickElevator(e: ElevatorSensorState): void {
  if (tickScenario(e)) {
    return;
  }

  if (e.faultTicksRemaining > 0) {
    e.faultTicksRemaining -= 1;
    e.healthState = e.faultTicksRemaining > 4 ? 'critical' : 'warning';
    e.doorState = e.faultCode === 'DOOR-BLOCKED' ? 'blocked' : e.doorState;
    e.direction = 'stationary';
    e.phase = 'idle';
    return;
  }

  if (e.faultCode && e.faultTicksRemaining <= 0) {
    e.faultCode = null;
    e.faultSeverity = null;
    e.lastFaultAt = null;
    e.healthState = 'normal';
    if (e.doorState === 'blocked') {
      e.doorState = 'open';
      e.doorOpenPercent = 100;
    }
  }

  if (Math.random() < 0.015) {
    e.faultCode = Math.random() < 0.5 ? 'DOOR-BLOCKED' : 'MOTOR-TEMP-HIGH';
    e.faultSeverity = e.faultCode === 'DOOR-BLOCKED' ? 'critical' : 'warning';
    e.healthState = e.faultSeverity === 'critical' ? 'critical' : 'warning';
    e.lastFaultAt = new Date().toISOString();
    e.faultTicksRemaining = 5 + Math.floor(Math.random() * 6);
    e.direction = 'stationary';
    e.phase = 'idle';
    if (e.faultCode === 'DOOR-BLOCKED') {
      e.doorState = 'blocked';
      e.doorOpenPercent = 65;
    }
    return;
  }

  switch (e.phase) {
    case 'idle':
      e.direction = 'stationary';
      e.doorState = 'open';
      e.doorOpenPercent = 100;
      e.loadPercentage = vary(e.loadPercentage, 14, 0, 92);
      if (Math.random() < 0.55) {
        e.targetFloor = chooseTarget(e.currentFloor);
        e.phase = 'doors_closing';
      }
      break;
    case 'doors_closing':
      e.doorState = 'closing';
      e.doorOpenPercent = clamp(e.doorOpenPercent - 35, 0, 100);
      if (e.doorOpenPercent === 0) {
        e.doorState = 'closed';
        e.direction = e.targetFloor > e.currentFloor ? 'up' : 'down';
        e.phase = 'moving';
        e.doorCycleCount += 1;
      }
      break;
    case 'moving':
      e.doorState = 'closed';
      e.doorOpenPercent = 0;
      e.direction = e.targetFloor > e.currentFloor ? 'up' : 'down';
      e.currentFloor += e.direction === 'up' ? 1 : -1;
      if (e.currentFloor === e.targetFloor) {
        e.direction = 'stationary';
        e.phase = 'doors_opening';
      }
      break;
    case 'doors_opening':
      e.doorState = 'opening';
      e.doorOpenPercent = clamp(e.doorOpenPercent + 40, 0, 100);
      if (e.doorOpenPercent === 100) {
        e.doorState = 'open';
        e.phase = 'idle';
      }
      break;
  }
}

function buildThing(e: ElevatorSensorState) {
  const moving = e.phase === 'moving';
  const status = e.faultCode ? 'fault' : moving ? 'moving' : e.phase === 'idle' ? 'idle' : 'door_open';
  const distanceToTarget = Math.abs(e.targetFloor - e.currentFloor);
  const loadKg = Math.round((e.loadPercentage / 100) * 1000);
  const motorTempBase = moving ? 39 : 32;
  const controllerTempBase = moving ? 34 : 29;
  const motorTempC =
    e.scenario === 'thermal' ? 96 : Math.round(vary(motorTempBase + e.loadPercentage / 18, 1.4, 28, 58));
  const controllerTempC =
    e.scenario === 'thermal' ? 91 : Math.round(vary(controllerTempBase + e.loadPercentage / 26, 1.2, 27, 54));
  const powerKw = Number((moving ? vary(9 + e.loadPercentage / 9, 1.8, 6, 18) : vary(0.8, 0.3, 0.2, 1.6)).toFixed(1));
  const vibrationLevel =
    e.scenario === 'vibration'
      ? 8.6
      : Number((e.healthState === 'normal' ? vary(0.16, 0.05, 0.05, 0.28) : vary(0.52, 0.18, 0.35, 0.9)).toFixed(2));
  const now = new Date().toISOString();

  return {
    thingId: e.thingId,
    attributes: {
      buildingId: e.buildingId,
      deviceType: 'elevator',
      shaftId: e.shaftId
    },
    features: {
      elevator: {
        properties: {
          status,
          currentFloor: e.currentFloor,
          targetFloor: e.targetFloor,
          positionMeters: Number(((e.currentFloor - 1) * 3.2).toFixed(1)),
          floorProgress: moving ? 0.5 : 0,
          speedMps: moving ? 1.2 + Number((e.loadPercentage / 300).toFixed(2)) : 0,
          accelerationMps2: moving ? 0.12 : 0,
          direction: e.direction,
          doorState: e.doorState,
          doorOpenPercent: e.doorOpenPercent,
          doorObstruction: e.doorState === 'blocked',
          doorCycleCount: e.doorCycleCount,
          loadKg,
          ratedLoadKg: 1000,
          loadPercentage: Math.round(e.loadPercentage),
          occupancyEstimate: Math.round(e.loadPercentage / 11),
          mode: e.faultCode ? 'maintenance' : 'normal',
          serviceMode: e.faultCode ? 'maintenance' : 'normal',
          brakeState: moving ? 'released' : 'engaged',
          motorState: e.faultCode ? 'fault' : moving ? 'running' : 'idle',
          controllerState: e.healthState === 'normal' ? 'normal' : e.healthState,
          motorTempC,
          controllerTempC,
          powerKw,
          vibrationLevel,
          healthState: e.healthState,
          faultCode: e.faultCode,
          faultSeverity: e.faultSeverity,
          lastFaultAt: e.lastFaultAt,
          activeCalls: distanceToTarget > 0 ? [{ floor: e.targetFloor, direction: e.direction, type: 'destination' }] : [],
          stopQueue: distanceToTarget > 0 ? [e.targetFloor] : [],
          etaSeconds: moving ? distanceToTarget * 4 : 0,
          lastUpdatedAt: now
        }
      }
    }
  };
}

async function postReplay(thing: ReturnType<typeof buildThing>): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/dev/ditto/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thing)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Replay failed: ${response.status} ${response.statusText} ${body}`);
  }
}

async function seed(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/dev/ditto/seed`, { method: 'POST' });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Seed failed: ${response.status} ${response.statusText} ${body}`);
  }
}

async function publishTick(): Promise<void> {
  tickCount += 1;
  applyScheduledScenario();

  for (const elevator of elevators) {
    tickElevator(elevator);
    const thing = buildThing(elevator);
    await postReplay(thing);
    const props = thing.features.elevator.properties;
    console.log(
      `${new Date().toISOString()} ${thing.thingId} ${props.status} floor=${props.currentFloor}->${props.targetFloor} door=${props.doorState} load=${props.loadPercentage}% temp=${props.motorTempC}/${props.controllerTempC}C vib=${props.vibrationLevel} health=${props.healthState}${elevator.scenario ? ` scenario=${elevator.scenario}` : ''}`
    );
  }
}

async function main(): Promise<void> {
  console.log(`Elevator sensor simulator -> ${apiBaseUrl} every ${intervalMs}ms`);
  console.log(
    `Risk scenarios ${riskScenariosEnabled ? 'enabled' : 'disabled'}${riskScenariosEnabled ? `, every ${scenarioEveryTicks} ticks` : ''}.`
  );
  console.log('Press Ctrl+C to stop.');
  if (seedFirst) {
    await seed();
    console.log('Seeded local L72 Ditto dataset.');
  }

  await publishTick();
  setInterval(() => {
    void publishTick().catch((error) => {
      console.error(error instanceof Error ? error.message : error);
    });
  }, intervalMs);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
