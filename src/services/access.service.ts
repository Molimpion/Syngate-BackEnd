// src/services/access.service.ts
import { 
  PrismaClient, 
  TipoDispositivo, 
  StatusAcesso, 
  FinalidadeLog, 
  DirecaoAcesso 
} from '@prisma/client';
import { isWithinShift } from '../utils/shift-validator';

const prisma = new PrismaClient();

export interface AccessRequestDTO {
  enderecoMac: string;
  uidCartao: string;
  direcao: 'ENTRADA' | 'SAIDA';
}

export interface AccessResponseDTO {
  granted: boolean;
  reason: string | null;
  userName?: string;
}

export class AccessService {
  /**
   * Processa a leitura de um cartão RFID, aplica as regras de negócio de turno
   * e decide se a porta/catraca deve ser liberada.
   */
  async processAccess(data: AccessRequestDTO): Promise<AccessResponseDTO> {
    const { enderecoMac, uidCartao, direcao } = data;

    // 1. Identificar o Dispositivo e a Sala associada
    const dispositivo = await prisma.dispositivo.findUnique({
      where: { enderecoMac },
      include: { sala: true },
    });

    if (!dispositivo) {
      throw new Error(`Dispositivo com MAC ${enderecoMac} não cadastrado no sistema.`);
    }

    // 2. Identificar o Usuário pelo Cartão e seu Turno de permissão
    const usuario = await prisma.usuario.findUnique({
      where: { cartaoId: uidCartao },
      include: { turno: true },
    });

    const dataHoraAtual = new Date();
    let granted = false;
    let motivo: string | null = null;
    
    // Define a finalidade com base no tipo de equipamento físico
    const finalidade = dispositivo.tipo === TipoDispositivo.CATRACA 
      ? FinalidadeLog.ENTRADA_PREDIO 
      : FinalidadeLog.PRESENCA_SALA;

    // -------------------------------------------------------------------
    // MOTOR DE REGRAS DE ACESSO (RULE ENGINE)
    // -------------------------------------------------------------------

    if (!usuario) {
      // Regra 1: Cartão Desconhecido (Hard Block)
      motivo = 'Cartão não registrado no sistema.';
    } else if (!usuario.ativo) {
      // Regra 2: Usuário Inativo/Bloqueado (Hard Block)
      motivo = 'Acesso bloqueado: Usuário inativo na instituição.';
    } else if (usuario.dataExpiracao && usuario.dataExpiracao < dataHoraAtual) {
      // Regra 3: Validade Expirada (Hard Block para visitantes/contratos)
      motivo = 'Acesso negado: Credencial expirada.';
    } else {
      // Regra 4: Validação do Turno do Usuário
      // Se usuario.turno for nulo (ex: gestores), turnoValido é sempre true
      const turnoValido = usuario.turno ? isWithinShift(dataHoraAtual, usuario.turno) : true;

      if (turnoValido) {
        // Tudo certo: Usuário dentro do horário regular.
        granted = true;
      } else {
        // Regra 5: Tratamento diferenciado por tipo de equipamento (Soft Audit vs Hard Block)
        if (dispositivo.tipo === TipoDispositivo.CATRACA) {
          // Soft Audit: Catraca do prédio libera, mas cria a flag de auditoria.
          granted = true;
          motivo = 'Aviso: Acesso fora do horário regular (Turno).';
        } else if (dispositivo.tipo === TipoDispositivo.LEITOR_CARTAO) {
          // Hard Block: Laboratório ou sala restrita barra acesso fora do horário.
          granted = false;
          motivo = 'Acesso negado: Fora do horário reservado para este laboratório/sala.';
        }
      }
    }

    // -------------------------------------------------------------------
    // GRAVAÇÃO DA TRILHA DE AUDITORIA (LOG)
    // -------------------------------------------------------------------
    
    // Mapeamento dinâmico da direção enviada pelo payload do IoT
    const direcaoLog = direcao === 'SAIDA' ? DirecaoAcesso.SAIDA : DirecaoAcesso.ENTRADA;

    await prisma.logAcesso.create({
      data: {
        status: granted ? StatusAcesso.CONCEDIDO : StatusAcesso.NEGADO,
        finalidade,
        direcao: direcaoLog,
        motivo,
        usuarioId: usuario?.id || null,
        uidCartao,
        dispositivoId: dispositivo.id,
        dataHora: dataHoraAtual,
      },
    });

    // Retorna a instrução clara para o firmware do ESP32
    return {
      granted,
      reason: motivo,
      userName: usuario ? usuario.nome.split(' ')[0] : undefined, // Primeiro nome para displays LCD
    };
  }
}