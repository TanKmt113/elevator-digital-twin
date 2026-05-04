import type { Twin3DMapping } from './twin3d-mapping.model.js';

export class Twin3DMappingRepository {
  private readonly mappings = new Map<string, Twin3DMapping>();

  save(mapping: Twin3DMapping): Twin3DMapping {
    this.mappings.set(mapping.elevatorId, mapping);
    return mapping;
  }

  get(elevatorId: string): Twin3DMapping | undefined {
    return this.mappings.get(elevatorId);
  }

  list(): Twin3DMapping[] {
    return [...this.mappings.values()];
  }
}
