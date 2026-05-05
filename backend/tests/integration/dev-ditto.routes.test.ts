import { describe, expect, it, vi } from 'vitest';
import { createDevDittoRoutes, seedLocalTwinDataset, type LocalTwinDataset } from '../../src/api/routes/dev-ditto.routes.js';

describe('dev ditto seed routes', () => {
  it('registers the dev Ditto seed endpoint', () => {
    const router = createDevDittoRoutes({
      upsertPolicy: vi.fn(async () => undefined),
      upsertThing: vi.fn(async () => undefined),
      emit: vi.fn()
    });
    const routes =
      router?.stack.flatMap((layer) => (layer.route?.path ? [layer.route.path] : [])) ?? [];

    expect(routes).toContain('/dev/ditto/seed');
    expect(routes).toContain('/dev/ditto/replay');
  });

  it('upserts the local dataset policy and all elevator things', async () => {
    const dataset: LocalTwinDataset = {
      datasetId: 'local-l72-elevators',
      buildingId: 'L72',
      policyId: 'org.example:l72-elevator-policy',
      elevators: [
        {
          thingId: 'org.example:L72-ELEV-A',
          attributes: {},
          features: {
            elevator: {
              properties: {
                currentFloor: 1
              }
            }
          }
        }
      ]
    };

    const upsertPolicy = vi.fn(async () => undefined);
    const upsertThing = vi.fn(async () => undefined);

    const result = await seedLocalTwinDataset(
      {
        upsertPolicy,
        upsertThing
      },
      dataset
    );

    expect(upsertPolicy).toHaveBeenCalledWith(
      'org.example:l72-elevator-policy',
      expect.objectContaining({
        entries: expect.any(Object)
      })
    );
    expect(upsertThing).toHaveBeenCalledWith(
      'org.example:L72-ELEV-A',
      expect.objectContaining({
        policyId: 'org.example:l72-elevator-policy',
        attributes: expect.objectContaining({
          buildingId: 'L72',
          deviceType: 'elevator'
        })
      })
    );
    expect(result).toMatchObject({
      datasetId: 'local-l72-elevators',
      buildingId: 'L72',
      seededThings: 1
    });
  });
});
