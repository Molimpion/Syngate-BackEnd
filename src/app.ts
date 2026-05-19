import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { openapiSpecification } from './config/swagger';
import { renderScalar } from './config/scalar-config';
import { globalRateLimiter } from './middlewares/rate-limit.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

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
app.use(cors());
app.use(express.json());

// --- Rotas de Infraestrutura (Isentas de Rate Limit) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'syngate-backend' });
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.get('/docs', (req, res) => {
  res.send(renderScalar(openapiSpecification));
});

// --- Barreira de Proteção contra Força Bruta e DDoS ---
// Aplicado aqui para proteger apenas as rotas de negócio subsequentes
app.use(globalRateLimiter);

// TODO: Inserir os roteadores da API aqui
// Exemplo futuro: app.use('/api/v1/auth', authRouter);
// Exemplo futuro: app.use('/api/v1/acesso', accessRouter);

// --- Middleware de Tratamento Global de Erros ---
// DEVE ser o último middleware registrado na aplicação
app.use(errorHandler);

export { app };