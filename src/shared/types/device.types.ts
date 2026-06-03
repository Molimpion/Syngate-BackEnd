import { Dispositivo, TipoDispositivo, StatusDispositivo } from '@prisma/client';

export type DispositivoDTO = Omit<Dispositivo, 'hashChaveSeguranca' | 'logs'>;

export interface DeviceAuthHeader {
  'x-device-id': string;
  'x-device-secret': string;
}

export interface CreateDevicePayload {
  nome: string;
  tipo?: TipoDispositivo;
  enderecoMac: string;
  salaId: string;
  ipLocal?: string;
}

export interface UpdateDevicePayload {
  nome?: string;
  tipo?: TipoDispositivo;
  status?: StatusDispositivo;
  enderecoMac?: string;
  salaId?: string;
  ipLocal?: string;
}