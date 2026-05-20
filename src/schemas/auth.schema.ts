import { z } from 'zod';
import { PapelUsuario } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de e-mail inválido.'),
    senha: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.'),
  }),
});

export const cadastroSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    email: z.string().email('Formato de e-mail inválido.'),
    senha: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.'),
    papel: z.nativeEnum(PapelUsuario).optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório.'),
  }),
});