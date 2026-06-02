import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { CreateShiftPayload, UpdateShiftPayload } from '../../shared/types/shift.types';

export class ShiftsService {
  async create(data: CreateShiftPayload) {
    return prisma.turno.create({ data });
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
    return prisma.turno.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateShiftPayload) {
    try {
      return await prisma.turno.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('404:Turno não encontrado.');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.turno.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('404:Turno não encontrado.');
        if (error.code === 'P2003') throw new Error('400:Não é possível excluir este turno pois existem usuários vinculados a ele.');
      }
      throw error;
    }
  }
}