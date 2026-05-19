import { Turno } from '@prisma/client';

/**
 * Converte um objeto Date para minutos desde a meia-noite no fuso horário local do servidor.
 */
export function dateToMinutes(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

/**
 * Mapeia o dia da semana nativo do JS (0-6, onde 0 = Domingo) 
 * para o padrão ISO 8601 (1-7, onde 1 = Segunda e 7 = Domingo).
 */
export function getIsoDayOfWeek(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Verifica se um determinado momento está dentro da janela do turno
 * e se o dia da semana atual é permitido.
 */
export function isWithinShift(date: Date, turno: Turno): boolean {
  const currentIsoDay = getIsoDayOfWeek(date);
  
  if (!turno.diasSemana.includes(currentIsoDay)) {
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