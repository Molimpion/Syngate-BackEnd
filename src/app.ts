import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { openapiSpecification } from './config/swagger';
import { renderScalar } from './config/scalar-config'; 

const app = express();

// Middlewares (Helmet, CORS, Pino...)
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

// Rota de Teste
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'syngate-backend' });
});

// 1. Swagger Clássico
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// 2. Scalar Moderno (Limpo e elegante)
app.get('/docs', (req, res) => {
  res.send(renderScalar(openapiSpecification));
});

export { app };