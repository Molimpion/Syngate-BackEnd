import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'O nome da sala deve ter no mínimo 2 caracteres.'),
    bloco: z.string().optional(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    nome: z.string().min(2).optional(),
    bloco: z.string().nullable().optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid('ID da sala inválida.'),
  }),
});