import { JwtPayload } from './auth.types';
import { Dispositivo } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
      device?: Dispositivo;
    }
  }
}