import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../../lib/redis';

export const globalRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...rest] = args;
      return redis.call(command, ...rest) as any;
    },
  }),
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    status: 'error',
    message: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos e tente novamente.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});