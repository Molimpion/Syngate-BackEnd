# False Positives Reference

## Arquivos Ignorados

- `__mocks__/**` — Arquivos de mock
- `**/*.d.ts` — Definições de tipo
- `main.ts` / `app.ts` — Bootstrap puro
- `*.config.ts` — Configuração estática
- `dist/` — Compilado
- `coverage/` — Relatórios

## Padrões Permitidos (Não reportar)

### 1. Funções exportadas mas usadas em teste
```typescript
// É ok não testar a função que inicializa a app
export function initializeApp() { ... }
```

### 2. Branches de erro em teste
```typescript
// É ok se o erro nunca acontece em teste (BD conecta sempre)
if (!db) throw new Error('...');
```

### 3. Tipos TypeScript (automático ignorado)
```typescript
export type UserRole = 'admin' | 'user';
// Não é "cobertura de função"
```

## Quando Reportar Mesmo com Baixa Cobertura

- Funções críticas (auth, pagamento, validação)
- Lógica com branching complexo
- Tratamento de erro em caminho feliz

## Exemplo de Descarte

**Achado**: `src/config/database.ts` tem 0% cobertura

**Descarte**: Arquivo de configuração estática, sem lógica testável. Coberto implicitamente por testes de integração.
