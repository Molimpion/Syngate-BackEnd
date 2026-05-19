import { Dispositivo } from '@prisma/client';

export type DispositivoDTO = Omit<Dispositivo, 'id' | 'logs'>;

export interface DeviceAuthHeader {
  'x-device-id': string;
  'x-device-secret': string;
}