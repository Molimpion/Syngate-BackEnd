# Logging Configuration Reference

## Checklist Básico

- [ ] Logger configurado (Winston, Pino)
- [ ] `LOG_LEVEL` via variável de ambiente
- [ ] Logs em JSON (não text)
- [ ] Transports definidos (console, file, Sentry)
- [ ] Contexto global (service, version, environment)
- [ ] Request ID propagado

## Configuração Recomendada (Winston)

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

## Uso

```typescript
logger.info('User logged in', { userId: 123, requestId: 'abc-123' });
logger.error('Payment failed', { error: err.message, stack: err.stack });
```

## Verificação

```bash
LOG_LEVEL=debug npm start
tail -f logs/combined.log | jq
```
