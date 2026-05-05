import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchElevatorBootstrap } from '../../src/services/api/client';

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requests elevator bootstrap from the backend with building scope and bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        meta: {
          synchronization: {
            bootstrapStatus: 'empty'
          }
        }
      })
    });

    vi.stubGlobal('fetch', fetchMock);

    await fetchElevatorBootstrap('L72', 'token-123');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/elevators?buildingId=L72', {
      headers: {
        Authorization: 'Bearer token-123'
      }
    });
  });

  it('raises an ApiError when backend bootstrap fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          message: 'Bearer token required'
        })
      })
    );

    await expect(fetchElevatorBootstrap('L72')).rejects.toMatchObject({
      message: 'Bearer token required',
      status: 401
    } satisfies Partial<ApiError>);
  });
});
