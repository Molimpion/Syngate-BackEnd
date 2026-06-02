import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateShiftPayload {
  nome: string;
  horaInicio: number;
  horaFim: number;
  diasSemana: number[];
}

export interface UpdateShiftPayload {
  nome?: string;
  horaInicio?: number;
  horaFim?: number;
  diasSemana?: number[];
}

export class ShiftsService {
  async create(data: CreateShiftPayload) {
    return prisma.turno.create({
      data,
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const whereClause = search
      ? { nome: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [total, turnos] = await Promise.all([
      prisma.turno.count({ where: whereClause }),
      prisma.turno.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      data: turnos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.turno.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateShiftPayload) {
    return prisma.turno.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.turno.delete({
      where: { id },
    });
  }
}