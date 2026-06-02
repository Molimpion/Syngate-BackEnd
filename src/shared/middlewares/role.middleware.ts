import { Request, Response, NextFunction } from 'express';
import { PapelUsuario } from '@prisma/client';

export const roleMiddleware = (papeisPermitidos: PapelUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Usuário não autenticado.' });
    }

    if (!papeisPermitidos.includes(req.user.papel)) {
      return res.status(403).json({ status: 'error', message: 'Acesso negado. Privilégios insuficientes.' });
    }

    return next();
  };
};