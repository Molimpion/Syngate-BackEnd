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
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';

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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'syngate-backend' });
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
  app.get('/docs', (req, res) => {
    res.send(renderScalar(openapiSpecification));
  });
}

app.use(globalRateLimiter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

export { app };