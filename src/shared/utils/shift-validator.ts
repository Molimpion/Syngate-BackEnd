import { Turno } from '@prisma/client';

/**
 * Convenção de dias da semana: padrão nativo JavaScript (Date.getDay())
 * 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
 * 4 = Quinta, 5 = Sexta, 6 = Sábado
 */

/**
 * Converte um objeto Date para minutos desde a meia-noite no fuso horário local do servidor.
 */
export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Retorna o dia da semana no padrão nativo JS (0-6, onde 0 = Domingo).
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Verifica se um determinado momento está dentro da janela do turno
 * e se o dia da semana atual é permitido.
 */
export function isWithinShift(date: Date, turno: Turno): boolean {
  const currentDay = getDayOfWeek(date);

  if (!turno.diasSemana.includes(currentDay)) {
    return false;
  }

  const currentMinutes = dateToMinutes(date);

  // Tratamento para turnos noturnos que atravessam a meia-noite (ex: 22:00 às 06:00)
  if (turno.horaInicio > turno.horaFim) {
    return currentMinutes >= turno.horaInicio || currentMinutes <= turno.horaFim;
  }

  // Turno diurno padrão (ex: 08:00 às 18:00)
  return currentMinutes >= turno.horaInicio && currentMinutes <= turno.horaFim;
}