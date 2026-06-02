import { z } from 'zod';
import { TipoDispositivo, StatusDispositivo } from '@prisma/client';

const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

export const createDeviceSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome do dispositivo deve ter no mínimo 3 caracteres.'),
    tipo: z.nativeEnum(TipoDispositivo).optional(),
    enderecoMac: z.string()
      .toUpperCase()
      .regex(macRegex, 'O endereço MAC deve estar no formato AA:BB:CC:DD:EE:FF.'),
    salaId: z.string().uuid('ID da sala inválida. É obrigatório vincular a uma sala.'),
    ipLocal: z.string().ip('Formato de IP local inválido.').optional(),
  }),
});

export const updateDeviceSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    tipo: z.nativeEnum(TipoDispositivo).optional(),
    status: z.nativeEnum(StatusDispositivo).optional(),
    enderecoMac: z.string().toUpperCase().regex(macRegex).optional(),
    salaId: z.string().uuid().optional(),
    ipLocal: z.string().ip().optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid('ID do dispositivo inválido.'),
  }),
});