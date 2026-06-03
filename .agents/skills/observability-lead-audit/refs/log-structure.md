# Log Structure Reference

## Formato Correto (JSON)

```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "level": "error",
  "message": "Payment processing failed",
  "service": "api",
  "version": "1.0.0",
  "requestId": "req-123-abc",
  "userId": 456,
  "metadata": {
    "orderId": 789,
    "provider": "stripe",
    "error": "card_declined"
  },
  "stack": "Error: card_declined\n    at ..."
}
```

## Campos Obrigatórios

| Campo | Tipo | Exemplo |
|-------|------|---------|
| timestamp | ISO8601 | 2025-01-15T10:30:45.123Z |
| level | string | error, warn, info, debug |
| message | string | "Payment processing failed" |
| service | string | "api", "worker", "scheduler" |
| requestId | string | "req-123-abc" |
| stack | string (erro) | Full stack trace |

## Campos Contextuais (conforme aplicável)

```typescript
logger.error('Operation failed', {
  userId: user.id,           // Se aplicável
  requestId: req.id,         // Sempre em request
  operationId: uuidv4(),     // Para rastreamento
  duration: Date.now() - start,
  resource: { type: 'Order', id: 123 },
  error: err.message,        // Nunca enviar err direto
  stack: err.stack,          // Para erros apenas
});
```

## Anti-padrões

❌ Log em string concatenada:
```typescript
logger.info('User ' + userId + ' logged in at ' + new Date());
```

✅ Log estruturado:
```typescript
logger.info('User logged in', { userId, timestamp: new Date() });
```

## Níveis de Log

| Level | Quando | Exemplo |
|-------|--------|---------|
| error | Falha operacional, precisa correção | Payment failed |
| warn | Anomalia, mas continua funcionando | Retry attempt 3/3 |
| info | Evento importante, normal | User logged in |
| debug | Diagnóstico, desligado em prod | SQL query params |

## Checklist

- [ ] Logs em JSON
- [ ] Timestamp automático
- [ ] Level correto (não tudo info)
- [ ] RequestId propagado
- [ ] Sem concatenação de string
- [ ] Stack trace apenas em errors
