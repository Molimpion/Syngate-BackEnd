import { z } from 'zod';
import { PapelUsuario } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    email: z.string().email('Formato de e-mail inválido.'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    matricula: z.string().optional(),
    curso: z.string().optional(),
    papel: z.nativeEnum(PapelUsuario).default(PapelUsuario.ALUNO),
    turnoId: z.string().uuid('ID do turno inválido.').optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    email: z.string().email().optional(),
    matricula: z.string().optional(),
    curso: z.string().optional(),
    papel: z.nativeEnum(PapelUsuario).optional(),
    turnoId: z.string().uuid().optional(),
    ativo: z.boolean().optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid('ID de usuário inválido.'),
  }),
});

export const linkCardSchema = z.object({
  body: z.object({
    cartaoId: z.string().min(1, 'O UID do cartão é obrigatório.').nullable(),
  }),
  params: z.object({
    id: z.string().uuid('ID de usuário inválido.'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, 'A página deve ser maior que 0.').default(1),
    limit: z.coerce.number().min(1).max(100, 'O limite máximo é 100 itens por página.').default(10),
    search: z.string().optional(),
  }),
});