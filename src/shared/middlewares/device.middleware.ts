import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { hashDeviceKey } from '../utils/device-key';

export const deviceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const mac = req.headers['x-device-mac'] as string;
  const key = req.headers['x-device-key'] as string;

  if (!mac || !key) {
    return res.status(403).json({ status: 'error', message: 'Credenciais do dispositivo ausentes.' });
  }

  try {
    const device = await prisma.dispositivo.findUnique({
      where: { enderecoMac: mac },
    });

    if (!device || !device.hashChaveSeguranca || device.status !== 'ATIVO') {
      return res.status(403).json({ status: 'error', message: 'Acesso negado.' });
    }

    if (device.hashChaveSeguranca !== hashDeviceKey(key)) {
      return res.status(403).json({ status: 'error', message: 'Acesso negado.' });
    }

    req.device = device;
    return next();
 } catch (error) {
  return res.status(403).json({ status: 'error', message: 'Acesso negado.' });
}
};