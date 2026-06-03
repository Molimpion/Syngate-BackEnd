# Swallowed Errors Reference

## Anti-padrões

### 1. Catch Vazio
```typescript
// ❌ Erro desaparece
try {
  await database.connect();
} catch (e) {
  // Silencioso!
}

// ✅ Log + rethrow ou handle
try {
  await database.connect();
} catch (e) {
  logger.error('DB connection failed', { error: e });
  throw e;  // ou handle específico
}
```

### 2. Try-Catch com Return Silent
```typescript
// ❌ Erro engolido
async function getUser(id) {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (e) {
    return null;  // Sem log!
  }
}

// ✅ Correto
async function getUser(id) {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (e) {
    logger.warn('User not found', { userId: id, error: e.message });
    return null;
  }
}
```

### 3. Promise.catch() Silencioso
```typescript
// ❌ Erro engolido
fetch('/api/data').catch(() => []);

// ✅ Log antes
fetch('/api/data')
  .catch(err => {
    logger.error('API call failed', { error: err });
    return [];
  });
```

## Checklist

- [ ] Nenhum `catch (e) { }` vazio
- [ ] Todo erro é loggado antes de handle
- [ ] Erros críticos são relanços (rethrow)
- [ ] Fallbacks têm contexto (por quê retornando null?)

## Níveis de Log por Tipo

| Erro | Level | Ação |
|------|-------|------|
| Payment failed | error | Log completo + alerta |
| Record not found | warn | Log simples + null |
| Retry attempted | debug | Log contexto |
| Expected validation | info | Log sem stack |
