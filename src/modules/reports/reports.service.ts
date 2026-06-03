import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { stringify } from 'csv-stringify/sync';
import { ReportFilters } from '../../shared/types/report.types';

export class ReportsService {
  async getAccessReport(filters: ReportFilters) {
    // 1. Gera uma chave única para o cache baseada nos filtros
    const cacheKey = `relatorio:acessos:${JSON.stringify(filters)}`;

    // 2. Tenta buscar do Redis primeiro
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 3. Constrói a query de filtro dinamicamente
    const whereClause: any = {};
    
    if (filters.dataInicio || filters.dataFim) {
      whereClause.dataHora = {};
      if (filters.dataInicio) whereClause.dataHora.gte = new Date(filters.dataInicio);
      if (filters.dataFim) whereClause.dataHora.lte = new Date(filters.dataFim);
    }
    if (filters.usuarioId) whereClause.usuarioId = filters.usuarioId;
    if (filters.dispositivoId) whereClause.dispositivoId = filters.dispositivoId;
    if (filters.status) whereClause.status = filters.status;

    // 4. Executa a busca crua e as agregações em paralelo
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
      prisma.logAcesso.groupBy({ by: ['direcao'], _count: true, where: whereClause })
    ]);

    // 5. Monta o objeto final de resposta
    const reportData = {
      resumo: {
        totalAcessos: logs.length,
        porStatus: totalPorStatus,
        porDirecao: totalPorDirecao,
      },
      detalhes: logs,
    };

    // 6. Salva no Redis com TTL de 5 minutos (300 segundos)
    await redis.set(cacheKey, JSON.stringify(reportData), 'EX', 300);

    return reportData;
  }

  async generateCSV(filters: ReportFilters): Promise<string> {
    const report = await this.getAccessReport(filters);

    // Mapeia os dados para um formato plano adequado para planilhas
    const flatData = report.detalhes.map((log: any) => ({
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

    // Gera a string CSV com cabeçalhos automáticos
    return stringify(flatData, { header: true, delimiter: ';' });
  }
}