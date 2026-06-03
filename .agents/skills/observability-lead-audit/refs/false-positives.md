# False Positives Reference

## Padrões Permitidos

### 1. Optional Chaining sem Catch
```typescript
// OK: propriedade pode não existir
const phone = user?.phone;  // Sem try-catch

// OK: chamada com fallback
const email = user?.getEmail?.() ?? 'unknown';
```

### 2. Console.log em Desenvolvimento
```typescript
// OK durante dev
console.log('DEBUG:', data);  // Remover antes de merge

// OK em teste
console.log('Test output');  // Esperado em jest output
```

### 3. Logs de Debug Desligados
```typescript
// OK: desligado em produção
if (process.env.NODE_ENV === 'development') {
  logger.debug('Verbose debug info', { ...data });
}
```

## Quando Reportar

- Erro não-loggado em operação crítica
- Dados sensíveis em log
- Fire-and-forget sem intenção explícita
- Promise sem catch/await
- Swallowed error sem explicação

## Exemplo de Descarte

**Achado**: `userRepository.findById()` não loga erro

**Contexto**: Chamador trata o erro e loga

**Descarte**: Padrão aceitável (repository não loga, controller loga). Correlacionar em stack trace.
