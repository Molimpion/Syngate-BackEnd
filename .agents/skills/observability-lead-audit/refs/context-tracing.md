# Context Tracing Reference

## Request ID / Trace ID

```typescript
// Middleware que adiciona requestId a todo request
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
});

// Todo log carrega o requestId
logger.info('User fetched', { requestId: req.id, userId });
```

## Propagação em Async Context

```typescript
import { AsyncLocalStorage } from 'async_hooks';

const requestStorage = new AsyncLocalStorage<{ requestId: string }>();

// Middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  requestStorage.run({ requestId }, () => next());
});

// Helper para logger
function getRequestId() {
  return requestStorage.getStore()?.requestId || 'unknown';
}

// Logs automáticos levam requestId
logger.info('Event', {
  requestId: getRequestId(),
  // ...
});
```

## Correlação Entre Serviços

```typescript
// Service A chama Service B
async function callServiceB() {
  const requestId = getRequestId();
  
  const response = await fetch('http://service-b/api', {
    headers: {
      'x-request-id': requestId,  // Passar forward
      'x-trace-id': traceId,
    },
  });
}

// Service B recebe e propaga
logger.info('Received call', {
  requestId: req.headers['x-request-id'],  // Mesmo ID
  traceId: req.headers['x-trace-id'],
});
```

## Exemplo Completo

```typescript
// Request chega
// 2025-01-15T10:30:45.123Z | info | User logged in | requestId=req-123

// Service inicia operação
// 2025-01-15T10:30:45.456Z | info | DB query | requestId=req-123 | operationId=op-456

// Cache miss
// 2025-01-15T10:30:45.567Z | debug | Cache miss | requestId=req-123 | operationId=op-456

// Response
// 2025-01-15T10:30:45.789Z | info | Response sent | requestId=req-123 | duration=666ms

// Mesmo requestId em todos → correlação simples
```

## Checklist

- [ ] RequestId/TraceId em todo request
- [ ] Propagado em chamadas entre serviços
- [ ] AsyncLocalStorage para contexto
- [ ] Todos logs carregam requestId
- [ ] Response header com requestId
- [ ] Dashboard correlaciona por ID
