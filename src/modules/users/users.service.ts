import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../utils/hash';
import { UsuarioPublico, CreateUsuarioPayload, UpdateUsuarioPayload } from '../../types/user.types';

const USER_SELECT_FIELDS = {
  id: true,
  nome: true,
  email: true,
  matricula: true,
  cartaoId: true,
  curso: true,
  papel: true,
  ativo: true,
  dataExpiracao: true,
  turnoId: true,
  criadoEm: true,
  atualizadoEm: true,
};

export class UsersService {
  async create(data: CreateUsuarioPayload): Promise<UsuarioPublico> {
    const conflito = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: data.email },
          data.matricula ? { matricula: data.matricula } : {},
        ],
      },
    });

    if (conflito) {
      if (conflito.email === data.email) throw new Error('409:E-mail já está em uso.');
      if (conflito.matricula === data.matricula) throw new Error('409:Matrícula já está em uso.');
    }

    const hashSenha = await hashPassword(data.senha);

    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        hashSenha,
        matricula: data.matricula,
        curso: data.curso,
        papel: data.papel,
        turnoId: data.turnoId,
      },
      select: USER_SELECT_FIELDS,
    }) as Promise<UsuarioPublico>;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { matricula: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, usuarios] = await Promise.all([
      prisma.usuario.count({ where: whereClause }),
      prisma.usuario.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: USER_SELECT_FIELDS,
        orderBy: { criadoEm: 'desc' },
      }),
    ]);

    return {
      data: usuarios as UsuarioPublico[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<UsuarioPublico | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS,
    }) as Promise<UsuarioPublico | null>;
  }

  async update(id: string, data: UpdateUsuarioPayload): Promise<UsuarioPublico> {
    // Desestruturação explícita — garante que apenas campos permitidos chegam ao banco
    const { nome, email, matricula, curso, papel, turnoId, ativo } = data;

    return prisma.usuario.update({
      where: { id },
      data: { nome, email, matricula, curso, papel, turnoId, ativo },
      select: USER_SELECT_FIELDS,
    }) as Promise<UsuarioPublico>;
  }

  async softDelete(id: string): Promise<UsuarioPublico> {
    return prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: USER_SELECT_FIELDS,
    }) as Promise<UsuarioPublico>;
  }

  async linkCard(id: string, cartaoId: string | null): Promise<UsuarioPublico> {
    if (cartaoId) {
      const cardExists = await prisma.usuario.findUnique({ where: { cartaoId } });
      if (cardExists && cardExists.id !== id) {
        throw new Error('409:Este cartão RFID já está vinculado a outro usuário.');
      }
    }

    return prisma.usuario.update({
      where: { id },
      data: { cartaoId },
      select: USER_SELECT_FIELDS,
    }) as Promise<UsuarioPublico>;
  }
}