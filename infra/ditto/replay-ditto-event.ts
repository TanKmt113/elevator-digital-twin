import { readFile } from 'node:fs/promises';

interface ReplayFixture {
  eventId: string;
  description: string;
  thing: Record<string, unknown> & { thingId: string };
}

const fixturePath = new URL('./replay-events.json', import.meta.url);

async function main(): Promise<void> {
  const eventId = process.argv[2];
  if (!eventId) {
    throw new Error('Usage: node --experimental-strip-types infra/ditto/replay-ditto-event.ts <eventId>');
  }

  const apiBaseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const fixtures = JSON.parse(await readFile(fixturePath, 'utf8')) as ReplayFixture[];
  const fixture = fixtures.find((candidate) => candidate.eventId === eventId);

  if (!fixture) {
    throw new Error(`Unknown eventId: ${eventId}`);
  }

  const response = await fetch(`${apiBaseUrl}/dev/ditto/replay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fixture.thing)
  });

  if (!response.ok) {
    throw new Error(`Replay failed: ${response.status} ${response.statusText}`);
  }

  console.log(
    JSON.stringify(
      {
        eventId: fixture.eventId,
        description: fixture.description,
        result: await response.json()
      },
      null,
      2
    )
  );
}

void main();
