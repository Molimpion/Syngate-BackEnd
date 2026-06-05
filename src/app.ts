import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { openapiSpecification } from './config/swagger';
import { renderScalar } from './config/scalar-config';
import { globalRateLimiter } from './shared/middlewares/rate-limit.middleware';
import { errorHandler } from './shared/middlewares/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { roomsRouter } from './modules/rooms/rooms.routes';
import { shiftsRouter } from './modules/shifts/shifts.routes';
import { devicesRouter } from './modules/devices/devices.routes';
import { accessRouter } from './modules/access/access.routes';
import { reportsRouter } from './modules/reports/reports.routes';

const app = express();
app.set('trust proxy', 1);

const logger = pinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

// --- Middlewares de Segurança e Parse ---
app.use(logger);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
      },
    },
  })
);
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
}));

app.use(express.json());

// --- Rotas de Infraestrutura (Isentas de Rate Limit) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'syngate-backend' });
});

// Proteção Estratégica: A documentação só existe fora do ambiente de produção
if (process.env.NODE_ENV !== 'production') {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
  app.get('/docs', (req, res) => {
    res.send(renderScalar(openapiSpecification));
  });
}

// --- Barreira de Proteção contra Força Bruta e DDoS ---
app.use(globalRateLimiter);

// --- Roteadores da API ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/rooms', roomsRouter);
app.use('/api/v1/shifts', shiftsRouter);
app.use('/api/v1/devices', devicesRouter);
app.use('/api/v1/access', accessRouter);
app.use('/api/v1/reports', reportsRouter);

// --- Middleware de Tratamento Global de Erros ---
app.use(errorHandler);

export { app };