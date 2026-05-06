import type { ElevatorTwin } from '../../contracts/elevator.js';
import { createElevatorTwin } from './elevator-twin.model.js';
import { validateElevatorTwinForPublication } from './elevator-twin.validation.js';

export class ElevatorStateRepository {
  private readonly records = new Map<string, ElevatorTwin>();

  save(twin: ElevatorTwin): ElevatorTwin {
    return this.saveMaterialized(twin);
  }

  saveMaterialized(partial: Partial<ElevatorTwin> & Pick<ElevatorTwin, 'elevatorId' | 'buildingId'>): ElevatorTwin {
    const previous = this.records.get(partial.elevatorId);
    const materialized = createElevatorTwin({
      ...previous,
      ...partial,
      fieldFreshness: {
        ...(previous?.fieldFreshness ?? {}),
        ...(partial.fieldFreshness ?? createFieldFreshness(partial, partial.lastEventAt))
      }
    });
    const validation = validateElevatorTwinForPublication(materialized);

    if (!validation.valid) {
      throw new Error(`Invalid elevator twin: ${validation.errors.join(', ')}`);
    }

    this.records.set(materialized.elevatorId, materialized);
    return materialized;
  }

  list(): ElevatorTwin[] {
    return [...this.records.values()];
  }

  listByBuilding(buildingId: string): ElevatorTwin[] {
    return this.list().filter((twin) => twin.buildingId === buildingId);
  }

  get(elevatorId: string): ElevatorTwin | undefined {
    return this.records.get(elevatorId);
  }
}

function createFieldFreshness(partial: Partial<ElevatorTwin>, timestamp = new Date().toISOString()): Record<string, string> {
  return Object.fromEntries(
    Object.keys(partial)
      .filter((field) => field !== 'fieldFreshness')
      .map((field) => [field, timestamp])
  );
}
