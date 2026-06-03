import { prisma } from '../../lib/prisma';
import { isWithinShift } from '../../shared/utils/shift-validator';
import { systemEvents } from '../../shared/utils/events';
import { DirecaoAcesso, FinalidadeLog, StatusAcesso } from '@prisma/client';
import { AccessResult } from '../../shared/types/access-log.types';

export interface ProcessAccessDTO {
  uidCartao: string;
  direcao: DirecaoAcesso;
  finalidade: FinalidadeLog;
  dispositivoId: string;
}

export class AccessService {
  async processAccess(data: ProcessAccessDTO): Promise<AccessResult> {
    let granted = false;
    let reason: string | null = null;
    let status: StatusAcesso = StatusAcesso.NEGADO;
    let usuarioId: string | null = null;

    // 1. Busca o usuário atrelado ao cartão (e traz as regras do turno dele)
    const usuario = await prisma.usuario.findUnique({
      where: { cartaoId: data.uidCartao },
      include: { turno: true },
    });

    // 2. Validações baseadas na matriz de casos de teste da Task
    if (!usuario) {
      reason = 'Cartão não cadastrado';
    } else {
      usuarioId = usuario.id;

      if (!usuario.ativo) {
        reason = 'Usuário inativo';
      } else if (usuario.dataExpiracao && usuario.dataExpiracao < new Date()) {
        reason = 'Acesso expirado';
      } else if (usuario.turno && !isWithinShift(new Date(), usuario.turno)) {
        reason = 'Fora do horário permitido';
      } else {
        granted = true;
        status = StatusAcesso.CONCEDIDO;
      }
    }

    // 3. Grava o log rigorosamente (sempre salva o uidCartao bruto, mesmo se desconhecido)
    const log = await prisma.logAcesso.create({
      data: {
        uidCartao: data.uidCartao,
        dispositivoId: data.dispositivoId,
        usuarioId,
        status,
        direcao: data.direcao,
        finalidade: data.finalidade,
        motivo: reason,
      },
      include: {
        usuario: { select: { nome: true, matricula: true, papel: true } },
        dispositivo: { select: { nome: true, salaId: true } },
      },
    });

    // 4. Dispara o evento para o Dashboard via WebSockets (Socket.io)
    systemEvents.emit('access:new', log);

    // 5. Retorna o contrato estrito para a placa ESP32
    return { granted, reason };
  }
}