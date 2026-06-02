import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateRoomPayload {
  nome: string;
  bloco?: string;
}

export interface UpdateRoomPayload {
  nome?: string;
  bloco?: string | null;
}

export class RoomsService {
  async create(data: CreateRoomPayload) {
    try {
      return await prisma.sala.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('409:Já existe uma sala cadastrada com este nome neste bloco.');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' as const } },
            { bloco: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, salas] = await Promise.all([
      prisma.sala.count({ where: whereClause }),
      prisma.sala.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      data: salas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.sala.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateRoomPayload) {
    try {
      return await prisma.sala.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('409:A alteração conflita com outra sala já existente neste bloco.');
      }
      throw error;
    }
  }

  async delete(id: string) {
    return prisma.sala.delete({
      where: { id },
    });
  }
}