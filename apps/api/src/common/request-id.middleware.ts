import type { NextFunction, Request, Response } from 'express';
import { generateId } from './id';

export const REQUEST_ID_HEADER = 'x-request-id';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export interface RequestWithId extends Request {
  requestId?: string;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingId = req.header(REQUEST_ID_HEADER)?.trim();
  const requestId =
    incomingId && REQUEST_ID_PATTERN.test(incomingId)
      ? incomingId
      : generateId();
  (req as RequestWithId).requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
