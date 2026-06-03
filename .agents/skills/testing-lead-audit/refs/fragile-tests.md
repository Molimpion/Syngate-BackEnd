# Fragile Tests Red Flags

## Anti-padrões

### 1. Mocks Excessivos
```typescript
// ❌ Frágil
jest.mock('@/db/prisma');
jest.mock('@/services/payment');
jest.mock('@/cache/redis');

// ✅ Melhor
// Use testContainers ou mock apenas serviços externos (Stripe, SendGrid)
```

### 2. Snapshots Desatualizados
```typescript
// ❌ Problema
expect(result).toMatchSnapshot(); // Atualizado frequentemente

// ✅ Melhor
expect(result).toEqual({ id: 1, name: 'John' });
```

### 3. Timers Fake Sem Restauração
```typescript
// ❌ Frágil
jest.useFakeTimers();
// ... test code ...
// Sem jest.useRealTimers()

// ✅ Correto
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
```

### 4. Testes com `any` Type
```typescript
// ❌ Frágil
expect(result as any).toBeDefined();

// ✅ Correto
expect(result).toBeDefined();
expect(result).toHaveProperty('id');
```

## Indicadores

- Testes que passam mesmo com código quebrado
- Testes que falham em CI mas passam localmente
- Testes que precisam de atualização a cada mudança de schema
- Testes sem assertions reais (só `toBeDefined`)

## Métricas

| Status | O que Fazer |
|--------|-----------|
| > 10 snapshots desatualizados | Revisar manualmente |
| > 20 mocks | Considerar integração real |
| Flakiness > 5% | Investigar race conditions |
