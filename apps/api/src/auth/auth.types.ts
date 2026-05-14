import type { Request } from 'express';
import type { TokenPayload } from './token.service';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}
