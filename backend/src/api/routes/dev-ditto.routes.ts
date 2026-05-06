import { readFileSync } from 'fs';
import { Router } from 'express';
import type { DittoClient, DittoPolicy, DittoThing } from '../../integrations/ditto/ditto-client.js';

export interface LocalTwinDataset {
  datasetId: string;
  buildingId: string;
  policyId: string;
  elevators: DittoThing[];
}

const datasetPath = new URL('../../../../infra/ditto/local-l72-elevators.json', import.meta.url);

export function buildDefaultDittoPolicy(): DittoPolicy {
  return {
    entries: {
      DEFAULT: {
        subjects: {
          '{{ request:subjectId }}': {
            type: 'the creator'
          }
        },
        resources: {
          'policy:/': {
            grant: ['READ', 'WRITE'],
            revoke: []
          },
          'thing:/': {
            grant: ['READ', 'WRITE'],
            revoke: []
          },
          'message:/': {
            grant: ['READ', 'WRITE'],
            revoke: []
          }
        }
      }
    }
  };
}

export function loadLocalTwinDataset(): LocalTwinDataset {
  return JSON.parse(readFileSync(datasetPath, 'utf8')) as LocalTwinDataset;
}

export async function seedLocalTwinDataset(
  client: Pick<DittoClient, 'upsertPolicy' | 'upsertThing'>,
  dataset: LocalTwinDataset
): Promise<{
  datasetId: string;
  buildingId: string;
  policyId: string;
  seededThings: number;
  thingIds: string[];
}> {
  await client.upsertPolicy(dataset.policyId, buildDefaultDittoPolicy());

  const thingIds: string[] = [];

  for (const elevator of dataset.elevators) {
    const thingId = elevator.thingId;
    const buildingId =
      typeof elevator.attributes?.buildingId === 'string' ? elevator.attributes.buildingId : dataset.buildingId;

    const seededThing: DittoThing = {
      ...elevator,
      policyId: elevator.policyId ?? dataset.policyId,
      attributes: {
        ...elevator.attributes,
        buildingId,
        deviceType: elevator.attributes?.deviceType ?? 'elevator'
      }
    };

    await client.upsertThing(thingId, seededThing);
    thingIds.push(thingId);
  }

  return {
    datasetId: dataset.datasetId,
    buildingId: dataset.buildingId,
    policyId: dataset.policyId,
    seededThings: thingIds.length,
    thingIds
  };
}

export function createDevDittoRoutes(
  dittoClient: Pick<DittoClient, 'upsertPolicy' | 'upsertThing'> & { emit?: (payload: unknown) => void }
): Router {
  const router = Router();

  router.post('/dev/ditto/seed', async (_req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ code: 'ROUTE_NOT_FOUND', message: 'Not found' });
      return;
    }

    try {
      const dataset = loadLocalTwinDataset();
      const result = await seedLocalTwinDataset(dittoClient, dataset);
      res.json(result);
    } catch (error) {
      res.status(502).json({
        code: 'DITTO_SEED_FAILED',
        message: error instanceof Error ? error.message : 'Failed to seed Ditto dataset'
      });
    }
  });

  router.post('/dev/ditto/replay', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ code: 'ROUTE_NOT_FOUND', message: 'Not found' });
      return;
    }

    const thing = req.body as DittoThing | undefined;
    if (!thing?.thingId) {
      res.status(400).json({
        code: 'INVALID_DITTO_REPLAY',
        message: 'thingId is required in the request body'
      });
      return;
    }

    try {
      await dittoClient.upsertThing(thing.thingId, thing);
      dittoClient.emit?.({
        id: `dev-replay-${Date.now()}`,
        thingId: thing.thingId,
        time: new Date().toISOString(),
        value: thing
      });
      res.json({
        thingId: thing.thingId,
        replayedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(502).json({
        code: 'DITTO_REPLAY_FAILED',
        message: error instanceof Error ? error.message : 'Failed to replay Ditto change'
      });
    }
  });

  return router;
}
