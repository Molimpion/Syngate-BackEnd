import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../../lib/redis';
import { validate } from '../../shared/middlewares/validate.middlewares';
import { loginSchema, cadastroSchema, refreshTokenSchema, trocarSenhaSchema } from '../../schemas/auth.schema';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...rest] = args;
      return redis.call(command, ...rest) as any;
    },
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { status: 'error', message: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/login',          authRateLimiter, validate(loginSchema),        authController.login);
router.post('/cadastro',       authRateLimiter, validate(cadastroSchema),     authController.cadastro);
router.get( '/verificar-email',                                                authController.verificarEmail);
router.post('/refresh',                         validate(refreshTokenSchema), authController.refresh);
router.post('/logout',         authMiddleware,                                 authController.logout);
router.post('/trocar-senha',   authMiddleware,  validate(trocarSenhaSchema),  authController.trocarSenha);

export { router as authRouter };