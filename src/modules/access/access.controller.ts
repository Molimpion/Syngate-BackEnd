import { Request, Response } from 'express';
import { AccessService } from './access.service';

export class AccessController {
  private accessService = new AccessService();

  process = async (req: Request, res: Response) => {
    // O req.device é garantido pelo device.middleware.ts! Se chegou aqui, a placa é autêntica.
    const dispositivoId = req.device!.id;
    const { uidCartao, direcao, finalidade } = req.body;

    const result = await this.accessService.processAccess({
      uidCartao,
      direcao,
      finalidade,
      dispositivoId,
    });

    // Retorna exatamente a estrutura que a placa espera: { granted: boolean, reason: string }
    return res.status(200).json(result);
  };
}