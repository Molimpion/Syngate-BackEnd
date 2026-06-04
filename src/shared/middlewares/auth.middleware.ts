import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../../lib/redis';
import { prisma } from '../../lib/prisma';
import { JwtPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_development';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Não autorizado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ status: 'error', message: 'Não autorizado.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub, ativo: true },
    });

    if (!usuario) {
      return res.status(401).json({ status: 'error', message: 'Não autorizado.' });
    }

    req.user = { sub: usuario.id, papel: usuario.papel };
    return next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Não autorizado.' });
  }
};