export interface CreateShiftPayload {
  nome: string;
  horaInicio: number;
  horaFim: number;
  diasSemana: number[];
}

export interface UpdateShiftPayload {
  nome?: string;
  horaInicio?: number;
  horaFim?: number;
  diasSemana?: number[];
}