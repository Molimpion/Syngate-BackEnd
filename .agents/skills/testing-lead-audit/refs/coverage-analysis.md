# Coverage Analysis Reference

## O que Priorizar

1. **Services** (lógica de negócio) — CRÍTICO
2. **Controllers** (handlers de rota) — CRÍTICO
3. **Utils** (funções helper) — ALTO
4. **Guards/Middlewares** — ALTO
5. **Models** (schemas, tipos) — MÉDIO

## O que Ignorar

- `main.ts`, `app.ts` (bootstrap)
- Arquivos de configuração pura (`.config.ts`)
- Tipos TypeScript (`*.d.ts`)
- Mocks (`__mocks__/`)

## Métricas

| Cobertura | Status       | Ação                            |
|-----------|------------|-------------------------------|
| > 80%     | ✅ Bom     | Manter                         |
| 70-80%    | ⚠️  Aceitável | Adicionar testes antes de merge |
| 50-70%    | ❌ Baixa   | Priorizar testes               |
| < 50%     | 🔴 Crítica | Bloqueador de merge             |

## Exemplo

```json
{
  "total": {
    "lines": { "total": 1000, "covered": 750, "skipped": 0, "pct": 75 },
    "statements": { "total": 1050, "covered": 780, "skipped": 0, "pct": 74.29 },
    "functions": { "total": 120, "covered": 95, "skipped": 0, "pct": 79.17 },
    "branches": { "total": 200, "covered": 140, "skipped": 0, "pct": 70 }
  }
}
```

Focar em arquivos com `pct < 70`.
