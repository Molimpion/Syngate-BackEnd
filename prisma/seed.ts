import { 
  PrismaClient, 
  PapelUsuario, 
  TipoDispositivo, 
  StatusAcesso, 
  FinalidadeLog, 
  DirecaoAcesso 
} from '@prisma/client';
import { hashPassword } from '../src/shared/utils/hash';
import { hashDeviceKey } from '../src/shared/utils/device-key';

const prisma = new PrismaClient();

/**
 * Convenção de dias da semana: padrão nativo JavaScript (Date.getDay())
 * 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
 * 4 = Quinta, 5 = Sexta, 6 = Sábado
 */

async function main() {
  console.log('🌱 Iniciando expansão de dados do Seed com horários granulares...');

  // ---------------------------------------------------------
  // 1. TURNOS
  // ---------------------------------------------------------
  console.log('⏳ Criando Turnos de Alunos...');

  // diasSemana: [1,2,3,4,5] = Segunda a Sexta (padrão JS 0-6)
  const turnoAlunoManha = await prisma.turno.upsert({
    where: { id: 'aluno-manha' },
    update: {},
    create: { id: 'aluno-manha', nome: 'Aluno - Manhã', horaInicio: 480, horaFim: 720, diasSemana: [1, 2, 3, 4, 5] }, // 08:00 às 12:00
  });

  const turnoAlunoTarde = await prisma.turno.upsert({
    where: { id: 'aluno-tarde' },
    update: {},
    create: { id: 'aluno-tarde', nome: 'Aluno - Tarde', horaInicio: 780, horaFim: 1020, diasSemana: [1, 2, 3, 4, 5] }, // 13:00 às 17:00
  });

  const turnoAlunoNoite = await prisma.turno.upsert({
    where: { id: 'aluno-noite' },
    update: {},
    create: { id: 'aluno-noite', nome: 'Aluno - Noite', horaInicio: 1080, horaFim: 1320, diasSemana: [1, 2, 3, 4, 5] }, // 18:00 às 22:00
  });

  console.log('⏳ Criando Turnos de Professores (com margem de 30min)...');

  const turnoProfManha = await prisma.turno.upsert({
    where: { id: 'prof-manha' },
    update: {},
    create: { id: 'prof-manha', nome: 'Professor - Manhã', horaInicio: 450, horaFim: 750, diasSemana: [1, 2, 3, 4, 5] }, // 07:30 às 12:30
  });

  const turnoProfNoite = await prisma.turno.upsert({
    where: { id: 'prof-noite' },
    update: {},
    create: { id: 'prof-noite', nome: 'Professor - Noite', horaInicio: 1050, horaFim: 1350, diasSemana: [1, 2, 3, 4, 5] }, // 17:30 às 22:30
  });

  console.log('⏳ Criando Turnos de Staff e Gestão...');

  const turnoComercial = await prisma.turno.upsert({
    where: { id: 'staff-comercial' },
    update: {},
    create: { id: 'staff-comercial', nome: 'Funcionário - Comercial', horaInicio: 420, horaFim: 1080, diasSemana: [1, 2, 3, 4, 5] }, // 07:00 às 18:00
  });

  // diasSemana: [1,2,3,4,5,6] = Segunda a Sábado
  const turnoIntegral = await prisma.turno.upsert({
    where: { id: 'gestao-integral' },
    update: {},
    create: { id: 'gestao-integral', nome: 'Gestor - Integral', horaInicio: 360, horaFim: 1439, diasSemana: [1, 2, 3, 4, 5, 6] }, // 06:00 às 23:59
  });

  // ---------------------------------------------------------
  // 2. SALAS
  // ---------------------------------------------------------
  console.log('🏢 Criando Salas...');

  const portaria = await prisma.sala.upsert({
    where: { nome_bloco: { nome: 'Portaria Principal', bloco: 'Entrada' } },
    update: {},
    create: { nome: 'Portaria Principal', bloco: 'Entrada' },
  });

  const lab101 = await prisma.sala.upsert({
    where: { nome_bloco: { nome: 'Laboratório 101', bloco: 'A' } },
    update: {},
    create: { nome: 'Laboratório 101', bloco: 'A' },
  });

  // ---------------------------------------------------------
  // 3. DISPOSITIVOS (IoT)
  // ---------------------------------------------------------
  console.log('🔌 Criando Dispositivos IoT...');

  const fakeDeviceSecret = 'super-secret-key-123';
  const hashedDeviceKey = hashDeviceKey(fakeDeviceSecret);

  const catracaEntrada = await prisma.dispositivo.upsert({
    where: { enderecoMac: 'AA:BB:CC:DD:EE:01' },
    update: {},
    create: {
      nome: 'Catraca Principal',
      tipo: TipoDispositivo.CATRACA,
      enderecoMac: 'AA:BB:CC:DD:EE:01',
      hashChaveSeguranca: hashedDeviceKey,
      salaId: portaria.id,
      ipLocal: '192.168.1.100',
    },
  });

  const leitorLab = await prisma.dispositivo.upsert({
    where: { enderecoMac: 'AA:BB:CC:DD:EE:02' },
    update: {},
    create: {
      nome: 'Leitor Lab 101',
      tipo: TipoDispositivo.LEITOR_CARTAO,
      enderecoMac: 'AA:BB:CC:DD:EE:02',
      hashChaveSeguranca: hashedDeviceKey,
      salaId: lab101.id,
      ipLocal: '192.168.1.101',
    },
  });

  // ---------------------------------------------------------
  // 4. USUÁRIOS
  // ---------------------------------------------------------
  console.log('👥 Criando Usuários...');

  const defaultPassword = await hashPassword('Senha@123');

  const gestor = await prisma.usuario.upsert({
    where: { email: 'admin@syngate.com' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      email: 'admin@syngate.com',
      hashSenha: defaultPassword,
      papel: PapelUsuario.GESTOR,
      turnoId: turnoIntegral.id,
      matricula: 'ADM001',
      emailVerificado: true,
    },
  });

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'recepcao@syngate.com' },
    update: {},
    create: {
      nome: 'Maria Recepção',
      email: 'recepcao@syngate.com',
      hashSenha: defaultPassword,
      papel: PapelUsuario.FUNCIONARIO,
      turnoId: turnoComercial.id,
      matricula: 'FUN100',
      cartaoId: 'RFID-FUN-001',
      emailVerificado: true,
    },
  });

  const professor = await prisma.usuario.upsert({
    where: { email: 'professor.manha@syngate.com' },
    update: {},
    create: {
      nome: 'Professor Carlos (Matutino)',
      email: 'professor.manha@syngate.com',
      hashSenha: defaultPassword,
      papel: PapelUsuario.PROFESSOR,
      turnoId: turnoProfManha.id,
      matricula: 'PRF2026',
      cartaoId: 'RFID-PROF-001',
      curso: 'Sistemas de Informação',
      emailVerificado: true,
    },
  });

  const aluno = await prisma.usuario.upsert({
    where: { email: 'aluno.manha@syngate.com' },
    update: {},
    create: {
      nome: 'João Estudante (Matutino)',
      email: 'aluno.manha@syngate.com',
      hashSenha: defaultPassword,
      papel: PapelUsuario.ALUNO,
      turnoId: turnoAlunoManha.id,
      matricula: 'ALN2026',
      cartaoId: 'RFID-ALUN-002',
      curso: 'Análise e Desenvolvimento de Sistemas',
      dataExpiracao: new Date('2027-12-31T23:59:59.000Z'),
      emailVerificado: true,
    },
  });

  // ---------------------------------------------------------
  // 5. LOGS DE ACESSO
  // ---------------------------------------------------------
  console.log('📊 Gerando Logs de Acesso para testes de UI...');

  const totalLogs = await prisma.logAcesso.count();

  if (totalLogs === 0) {
    await prisma.logAcesso.createMany({
      data: [
        {
          status: StatusAcesso.CONCEDIDO,
          finalidade: FinalidadeLog.ENTRADA_PREDIO,
          direcao: DirecaoAcesso.ENTRADA,
          usuarioId: professor.id,
          uidCartao: professor.cartaoId,
          dispositivoId: catracaEntrada.id,
          dataHora: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
        {
          status: StatusAcesso.CONCEDIDO,
          finalidade: FinalidadeLog.PRESENCA_SALA,
          direcao: DirecaoAcesso.ENTRADA,
          usuarioId: aluno.id,
          uidCartao: aluno.cartaoId,
          dispositivoId: leitorLab.id,
          dataHora: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          status: StatusAcesso.NEGADO,
          finalidade: FinalidadeLog.PRESENCA_SALA,
          direcao: DirecaoAcesso.ENTRADA,
          motivo: 'Acesso negado: Fora do horário reservado para este laboratório/sala.',
          usuarioId: aluno.id,
          uidCartao: aluno.cartaoId,
          dispositivoId: leitorLab.id,
          dataHora: new Date(),
        },
        {
          status: StatusAcesso.CONCEDIDO,
          finalidade: FinalidadeLog.ENTRADA_PREDIO,
          direcao: DirecaoAcesso.ENTRADA,
          motivo: 'Aviso: Acesso fora do horário regular (Turno).',
          usuarioId: aluno.id,
          uidCartao: aluno.cartaoId,
          dispositivoId: catracaEntrada.id,
          dataHora: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
          status: StatusAcesso.NEGADO,
          finalidade: FinalidadeLog.ENTRADA_PREDIO,
          direcao: DirecaoAcesso.ENTRADA,
          motivo: 'Cartão não registrado no sistema.',
          uidCartao: 'RFID-DESCONHECIDO-999',
          dispositivoId: catracaEntrada.id,
          dataHora: new Date(Date.now() - 1000 * 60 * 30),
        },
      ],
    });
  } else {
    console.log('⚠️  Logs já existem. Pulando geração de logs para evitar dados duplicados.');
  }

  console.log('----------------------------------------------------');
  console.log('✅ Seed completo executado com sucesso!');
  console.log(`👤 Gestor: ${gestor.email}`);
  console.log(`👤 Funcionário: ${funcionario.email}`);
  console.log(`👤 Professor: ${professor.email}`);
  console.log(`👤 Aluno: ${aluno.email}`);
  console.log(`🔑 Senha Padrão para todos: Senha@123`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Falha ao rodar o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });