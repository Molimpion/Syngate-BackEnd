import { z } from 'zod';

export const createShiftSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome do turno deve ter no mínimo 3 caracteres.'),
    horaInicio: z.number()
      .int('A hora de início deve ser um número inteiro.')
      .min(0, 'Minutos não podem ser negativos.')
      .max(1439, 'Minutos não podem exceder 1439 (23:59).'),
    horaFim: z.number()
      .int('A hora de fim deve ser um número inteiro.')
      .min(0, 'Minutos não podem ser negativos.')
      .max(1439, 'Minutos não podem exceder 1439 (23:59).'),
    diasSemana: z.array(
      z.number()
        .int()
        .min(0, 'O dia da semana deve ser 0 (Domingo) a 6 (Sábado).')
        .max(6, 'O dia da semana deve ser 0 (Domingo) a 6 (Sábado).')
    ).min(1, 'O turno deve ter pelo menos um dia da semana.'),
  }),
});

export const updateShiftSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    horaInicio: z.number().int().min(0).max(1439).optional(),
    horaFim: z.number().int().min(0).max(1439).optional(),
    diasSemana: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid('ID do turno inválido.'),
  }),
});