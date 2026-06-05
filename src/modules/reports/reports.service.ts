import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { stringify } from 'csv-stringify/sync';
import { Prisma, StatusAcesso, StatusDispositivo } from '@prisma/client';
import { ReportFilters } from '../../shared/types/report.types';

export class ReportsService {
  async getStats() {
    const cacheKey = 'relatorio:stats';

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [totalAcessos, concedidos, negados, dispositivosAtivos] = await Promise.all([
      prisma.logAcesso.count({ where: { dataHora: { gte: hoje } } }),
      prisma.logAcesso.count({ where: { dataHora: { gte: hoje }, status: StatusAcesso.CONCEDIDO } }),
      prisma.logAcesso.count({ where: { dataHora: { gte: hoje }, status: StatusAcesso.NEGADO } }),
      prisma.dispositivo.count({ where: { status: StatusDispositivo.ATIVO } }),
    ]);

    const stats = { totalAcessos, concedidos, negados, dispositivosAtivos };

    // Cache de 60 segundos — alinhado com o intervalo de revalidação do frontend
    await redis.set(cacheKey, JSON.stringify(stats), 'EX', 60);

    return stats;
  }

  async getAccessReport(filters: ReportFilters) {
    const cacheKey = `relatorio:acessos:${JSON.stringify(filters)}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const whereClause: Prisma.LogAcessoWhereInput = {};

    if (filters.dataInicio || filters.dataFim) {
      whereClause.dataHora = {};
      if (filters.dataInicio) whereClause.dataHora.gte = new Date(filters.dataInicio);
      if (filters.dataFim) whereClause.dataHora.lte = new Date(filters.dataFim);
    }
    if (filters.usuarioId) whereClause.usuarioId = filters.usuarioId;
    if (filters.dispositivoId) whereClause.dispositivoId = filters.dispositivoId;
    if (filters.status) whereClause.status = filters.status as StatusAcesso;

    const [logs, totalPorStatus, totalPorDirecao] = await Promise.all([
      prisma.logAcesso.findMany({
        where: whereClause,
        include: {
          usuario: { select: { nome: true, matricula: true, papel: true } },
          dispositivo: { select: { nome: true, sala: { select: { nome: true, bloco: true } } } },
        },
        orderBy: { dataHora: 'desc' },
      }),
      prisma.logAcesso.groupBy({ by: ['status'], _count: true, where: whereClause }),
      prisma.logAcesso.groupBy({ by: ['direcao'], _count: true, where: whereClause }),
    ]);

    const reportData = {
      resumo: {
        totalAcessos: logs.length,
        porStatus: totalPorStatus,
        porDirecao: totalPorDirecao,
      },
      detalhes: logs,
    };

    await redis.set(cacheKey, JSON.stringify(reportData), 'EX', 300);

    return reportData;
  }

  async generateCSV(filters: ReportFilters): Promise<string> {
    const report = await this.getAccessReport(filters);

    const flatData = report.detalhes.map((log: Prisma.LogAcessoGetPayload<{
      include: {
        usuario: { select: { nome: true; matricula: true; papel: true } };
        dispositivo: { select: { nome: true; sala: { select: { nome: true; bloco: true } } } };
      };
    }>) => ({
      'Data e Hora': new Date(log.dataHora).toLocaleString('pt-BR'),
      'Status': log.status,
      'Direção': log.direcao,
      'Finalidade': log.finalidade,
      'Usuário': log.usuario?.nome || 'Não Registrado',
      'Matrícula': log.usuario?.matricula || '-',
      'Papel': log.usuario?.papel || '-',
      'Dispositivo': log.dispositivo?.nome || '-',
      'Sala': log.dispositivo?.sala?.nome || '-',
      'UID Cartão': log.uidCartao,
      'Motivo Negação': log.motivo || '-',
    }));

    return stringify(flatData, { header: true, delimiter: ';' });
  }
}