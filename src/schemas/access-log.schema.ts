import { z } from 'zod';
import { DirecaoAcesso, FinalidadeLog } from '@prisma/client';

export const accessLogSchema = z.object({
  body: z.object({
    uidCartao: z.string().min(1, 'UID do cartão é obrigatório.'),
    direcao: z.nativeEnum(DirecaoAcesso).default(DirecaoAcesso.ENTRADA),
    finalidade: z.nativeEnum(FinalidadeLog).default(FinalidadeLog.ENTRADA_PREDIO),
  }),
});