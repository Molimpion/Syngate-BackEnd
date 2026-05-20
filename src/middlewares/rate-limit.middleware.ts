import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis';

/**
 * Limitador de requisições global para evitar ataques de DDoS e Brute Force.
 * Configurado para 100 requisições por IP a cada 15 minutos.
 */
export const globalRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...rest] = args;
      return redis.call(command, ...rest) as any;
    },
  }),
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  limit: 100, // Limite de 100 requisições por IP na janela
  message: {
    status: 'error',
    message: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos e tente novamente.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});