import { prisma } from '../../lib/prisma';
import { generateDeviceKey, hashDeviceKey } from '../../shared/utils/device-key';
import { CreateDevicePayload, UpdateDevicePayload, DispositivoDTO } from '../../shared/types/device.types';

// Seleção padrão para blindar a chave de segurança
const DEVICE_SELECT = {
  id: true,
  nome: true,
  tipo: true,
  status: true,
  enderecoMac: true,
  ipLocal: true,
  salaId: true,
};

export class DevicesService {
  async provision(data: CreateDevicePayload): Promise<DispositivoDTO & { rawKey: string }> {
    try {
      const rawKey = generateDeviceKey();
      const hashChaveSeguranca = hashDeviceKey(rawKey);

      const device = await prisma.dispositivo.create({
        data: {
          ...data,
          hashChaveSeguranca,
        },
        select: DEVICE_SELECT,
      });

      // Retorna a chave crua APENAS no momento da criação
      return { ...device, rawKey };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('409:O endereço MAC informado já está cadastrado.');
      }
      if (error.code === 'P2003') {
        throw new Error('400:A sala informada não existe.');
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
            { enderecoMac: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, dispositivos] = await Promise.all([
      prisma.dispositivo.count({ where: whereClause }),
      prisma.dispositivo.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: DEVICE_SELECT,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      data: dispositivos,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<DispositivoDTO | null> {
    return prisma.dispositivo.findUnique({
      where: { id },
      select: DEVICE_SELECT,
    });
  }

  async update(id: string, data: UpdateDevicePayload): Promise<DispositivoDTO> {
    try {
      return await prisma.dispositivo.update({
        where: { id },
        data,
        select: DEVICE_SELECT,
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new Error('409:O endereço MAC informado já está cadastrado em outro dispositivo.');
      if (error.code === 'P2003') throw new Error('400:A sala informada não existe.');
      if (error.code === 'P2025') throw new Error('404:Dispositivo não encontrado.');
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.dispositivo.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new Error('404:Dispositivo não encontrado.');
      throw error;
    }
  }
}