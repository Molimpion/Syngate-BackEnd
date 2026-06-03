import { LogAcesso } from '@prisma/client';

export type LogAcessoDTO = Omit<LogAcesso, 'id'>;

export interface AccessResult {
  granted: boolean;
  reason: string | null;
}