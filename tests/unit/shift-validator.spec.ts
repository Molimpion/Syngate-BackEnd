import { isWithinShift } from '../../src/shared/utils/shift-validator';

describe('Shift Validator (Validação de Turnos)', () => {
  const turnoMatutino = {
    id: 'turno-1',
    nome: 'Manhã',
    horaInicio: 480, // 08:00
    horaFim: 720,    // 12:00
    diasSemana: [1, 2, 3, 4, 5], // Seg a Sex
  };

  it('deve PERMITIR o acesso se o horário e dia estiverem dentro do turno', () => {
    // 03 de Junho de 2026 é uma Quarta-feira (dia 3).
    // Configurando o relógio para 10:00 da manhã (dentro do turno)
    const dataMock = new Date('2026-06-03T10:00:00-03:00');
    
    const resultado = isWithinShift(dataMock, turnoMatutino);
    expect(resultado).toBe(true);
  });

  it('deve NEGAR o acesso se for no dia certo, mas em horário inválido', () => {
    // 13:00 da tarde (fora do turno)
    const dataMock = new Date('2026-06-03T13:00:00-03:00');
    
    const resultado = isWithinShift(dataMock, turnoMatutino);
    expect(resultado).toBe(false);
  });

  it('deve NEGAR o acesso se for no horário certo, mas em um final de semana', () => {
    // 07 de Junho de 2026 é um Domingo (dia 0).
    // 10:00 da manhã (horário certo, dia errado)
    const dataMock = new Date('2026-06-07T10:00:00-03:00');
    
    const resultado = isWithinShift(dataMock, turnoMatutino);
    expect(resultado).toBe(false);
  });
});