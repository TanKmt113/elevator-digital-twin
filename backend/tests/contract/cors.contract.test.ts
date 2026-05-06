import { describe, expect, it, vi } from 'vitest';
import { applyCorsHeaders } from '../../src/api/server.js';

describe('cors contract', () => {
  it('allows localhost frontend origins and auth headers', () => {
    const setHeader = vi.fn();
    const end = vi.fn();
    const status = vi.fn(() => ({ end }));
    const next = vi.fn();

    applyCorsHeaders(
      {
        method: 'GET',
        headers: {
          origin: 'http://localhost:5173'
        }
      } as any,
      {
        setHeader,
        status
      } as any,
      next
    );

    expect(setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
    expect(setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, X-Correlation-Id'
    );
    expect(setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    expect(next).toHaveBeenCalled();
  });

  it('terminates preflight requests with 204', () => {
    const setHeader = vi.fn();
    const end = vi.fn();
    const status = vi.fn(() => ({ end }));
    const next = vi.fn();

    applyCorsHeaders(
      {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:5173'
        }
      } as any,
      {
        setHeader,
        status
      } as any,
      next
    );

    expect(status).toHaveBeenCalledWith(204);
    expect(end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
