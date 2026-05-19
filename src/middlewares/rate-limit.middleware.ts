import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis';

/**
 * Limitador de requisições global para evitar ataques de DDoS e Brute Force.
 * Configurado para 100 requisições por IP a cada 15 minutos.
 */
export const globalRateLimiter = rateLimit({
  // O RedisStore gerencia a contagem de acessos no banco em memória
  store: new RedisStore({
    // A tipagem do sendCommand exige uma função que repasse os comandos ao ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  limit: 100, // Limite de 100 requisições por IP na janela
  message: {
    status: 'error',
    message: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos e tente novamente.',
  },
  standardHeaders: 'draft-7', // Retorna informações de limite nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita os headers legados `X-RateLimit-*`
});