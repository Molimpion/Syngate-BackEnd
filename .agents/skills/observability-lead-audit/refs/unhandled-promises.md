# Unhandled Promises Reference

## Anti-padrões

### 1. Async sem Await
```typescript
// ❌ Promise não-tratada
async function processOrder() {
  sendEmail(user.email);  // Sem await
  return order;
}

// ✅ Correto
async function processOrder() {
  await sendEmail(user.email);
  return order;
}
```

### 2. Promise em Loop
```typescript
// ❌ Promises em paralelo não-gerenciado
items.forEach(item => {
  processItem(item);  // Sem await
});

// ✅ Correto
await Promise.all(items.map(item => processItem(item)));
```

### 3. Then sem Catch
```typescript
// ❌ Erro silencioso
promise.then(result => doSomething(result));

// ✅ Correto
promise
  .then(result => doSomething(result))
  .catch(err => logger.error('Failed', { err }));
```

### 4. Sem Global Handler
```typescript
// ✅ Adicionar ao app
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});
```

## Checklist

- [ ] Global handler para unhandledRejection
- [ ] Global handler para uncaughtException
- [ ] Promise.all() para paralelo
- [ ] Nenhum fire-and-forget (salvo intentional)
- [ ] .catch() em todas as promises críticas

## Fire-and-Forget Intencional

OK com logging:
```typescript
// Comentar intenção
void sendAnalytics(event);  // Intentionally not awaited

logger.debug('Analytics sent in background', { eventId });
```
