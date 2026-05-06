import type { Response } from 'express';

export type ApiSuccess<T> = { success: true; data: T; error: null };
export type ApiFailure = {
  success: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
};

export function jsonSuccess<T>(res: Response, status: number, data: T): void {
  const body: ApiSuccess<T> = { success: true, data, error: null };
  res.status(status).json(body);
}

export function jsonError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
): void {
  const body: ApiFailure = {
    success: false,
    data: null,
    error: details === undefined ? { code, message } : { code, message, details }
  };
  res.status(status).json(body);
}
